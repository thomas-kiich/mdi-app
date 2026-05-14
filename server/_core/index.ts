import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import audioUploadRouter from "../routes/audioUpload";
import obsidianSyncRouter from "../routes/obsidianSync";
import stripeWebhookRouter from "../routes/stripeWebhook";
import { startPushJob } from "../pushJob";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe Webhook MUSS vor express.json() registriert werden (raw body für Signaturverifikation)
  app.use(stripeWebhookRouter);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Storage-Proxy für /manus-storage/* URLs
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Audio upload route (multipart/form-data)
  app.use(audioUploadRouter);

  // Audio-Proxy: liefert CDN-Audiodateien mit korrektem Content-Type und CORS
  // Audio-Proxy: HEAD + GET handler
  const audioProxyHandler = async (req: any, res: any) => {
    const url = req.query.url as string;
    if (!url || !url.startsWith('https://d2xsxph8kpxj0f.cloudfront.net/')) {
      return res.status(400).send('Invalid URL');
    }
    const isHead = req.method === 'HEAD';
    try {
      if (isHead) {
        // HEAD: fetch just the first byte to get Content-Length without streaming body
        const upstream = await fetch(url, { headers: { 'Range': 'bytes=0-0' } });
        if (!upstream.ok && upstream.status !== 206) {
          return res.status(upstream.status).send('Upstream error');
        }
        // Extract total size from Content-Range: bytes 0-0/TOTAL
        const cr = upstream.headers.get('content-range') || '';
        const totalMatch = cr.match(/\/(\d+)$/);
        const totalSize = totalMatch ? totalMatch[1] : upstream.headers.get('content-length') || '0';
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', totalSize);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).end();
      }

      const browserRange = req.headers.range as string | undefined;

      if (!browserRange) {
        // No Range header from browser: first do a HEAD-like request (bytes=0-0) to get total size,
        // then immediately flush 200 headers, then stream bytes=0- so the server never blocks.
        const metaReq = await fetch(url, { headers: { 'Range': 'bytes=0-0' } });
        if (metaReq.status !== 206 && metaReq.status !== 200) {
          return res.status(metaReq.status).send('Upstream error');
        }
        const metaCR = metaReq.headers.get('content-range') || '';
        const totalMatch = metaCR.match(/\/(\d+)$/);
        const totalSize = totalMatch ? totalMatch[1] : null;
        // Consume the tiny 1-byte body
        await metaReq.body?.cancel();

        // Now start the real stream
        const streamReq = await fetch(url, { headers: { 'Range': 'bytes=0-' } });
        if (streamReq.status !== 206 && streamReq.status !== 200) {
          return res.status(streamReq.status).send('Upstream error');
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Accept-Ranges', 'bytes');
        if (totalSize) res.setHeader('Content-Length', totalSize);
        res.status(200);
        // Flush headers immediately so browser can read duration
        res.flushHeaders();

        if (!streamReq.body) return res.end();
        const { Readable } = await import('stream');
        const nodeStream = Readable.fromWeb(streamReq.body as any);
        nodeStream.pipe(res);
        nodeStream.on('error', () => res.end());
        return;
      }

      // Range request: proxy it to add CORS headers
      const upstream = await fetch(url, { headers: { 'Range': browserRange } });

      if (upstream.status !== 200 && upstream.status !== 206) {
        return res.status(upstream.status).send('Upstream error');
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Accept-Ranges', 'bytes');

      const cl = upstream.headers.get('content-length');
      if (cl) res.setHeader('Content-Length', cl);
      const upstreamCR = upstream.headers.get('content-range') || '';
      if (upstreamCR) res.setHeader('Content-Range', upstreamCR);
      res.status(206);

      if (!upstream.body) return res.end();
      const { Readable: Readable2 } = await import('stream');
      const nodeStream2 = Readable2.fromWeb(upstream.body as any);
      nodeStream2.pipe(res);
      nodeStream2.on('error', () => res.end());
    } catch (e) {
      res.status(500).send('Proxy error');
    }
  };
  app.head('/api/audio-proxy', audioProxyHandler);
  app.get('/api/audio-proxy', audioProxyHandler);
  // App-Version-Endpoint: gibt Build-Timestamp zurück für iOS-kompatibles Update-Polling
  const APP_VERSION = process.env.APP_BUILD_TIME || Date.now().toString();
  app.get('/api/app-version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ version: APP_VERSION });
  });

  // Obsidian Sync API (Bearer-Token-Auth)
  app.use(obsidianSyncRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Hintergrund-Job für Web Push Notifications starten
    startPushJob();
  });
}

startServer().catch(console.error);
