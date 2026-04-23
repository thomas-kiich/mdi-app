import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import audioUploadRouter from "../routes/audioUpload";
import obsidianSyncRouter from "../routes/obsidianSync";
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
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Audio upload route (multipart/form-data)
  app.use(audioUploadRouter);

  // Audio-Proxy: liefert CDN-Audiodateien mit korrektem Content-Type und CORS
  app.get('/api/audio-proxy', async (req, res) => {
    const url = req.query.url as string;
    if (!url || !url.startsWith('https://d2xsxph8kpxj0f.cloudfront.net/')) {
      return res.status(400).send('Invalid URL');
    }
    try {
      // Always forward Range header; if browser sends none, request first chunk
      const rangeHeader = req.headers.range || 'bytes=0-';
      const upstream = await fetch(url, { headers: { 'Range': rangeHeader } });

      // Accept both 200 and 206 from upstream
      if (!upstream.ok && upstream.status !== 206) {
        return res.status(upstream.status).send('Upstream error');
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Accept-Ranges', 'bytes');

      // Forward content-length and content-range
      const cl = upstream.headers.get('content-length');
      if (cl) res.setHeader('Content-Length', cl);
      const cr = upstream.headers.get('content-range');
      if (cr) {
        res.setHeader('Content-Range', cr);
        res.status(206);
      } else {
        res.status(200);
      }

      // Stream bytes directly – no buffering
      if (!upstream.body) return res.end();
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(upstream.body as any);
      nodeStream.pipe(res);
      nodeStream.on('error', () => res.end());
    } catch (e) {
      res.status(500).send('Proxy error');
    }
  });
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
