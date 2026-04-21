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
      const upstream = await fetch(url);
      if (!upstream.ok) return res.status(502).send('Upstream error');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const buffer = await upstream.arrayBuffer();
      res.send(Buffer.from(buffer));
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
