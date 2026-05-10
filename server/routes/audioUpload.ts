/**
 * Express-Route für direkten Audio-Upload (multipart/form-data).
 * Umgeht die Base64-Limitierung von tRPC JSON.
 *
 * POST /api/audio/upload      – Momentaufnahmen (20 MB, alle Nutzer)
 * POST /api/podcast/upload    – Podcast-Episoden (200 MB, nur Admin)
 *
 * Returns: { audioUrl: string, fileKey: string }
 */

import express, { Request, Response } from "express";
import multer from "multer";
import { storagePut } from "../storage";
import { sdk } from "../_core/sdk";

const router = express.Router();

// multer: Dateien im Speicher halten (kein Disk-Schreiben)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// multer für Podcast-Uploads (bis 200 MB)
const podcastUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

// Momentaufnahmen-Upload (alle eingeloggten Nutzer)
router.post(
  "/api/audio/upload",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "Nicht angemeldet" });
      }

      if (!user) {
        return res.status(401).json({ error: "Nicht angemeldet" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Keine Audio-Datei empfangen" });
      }

      const mimeType = (req.body.mimeType as string) || req.file.mimetype || "audio/webm";
      const ext = mimeType.includes("webm")
        ? "webm"
        : mimeType.includes("mp4") || mimeType.includes("m4a")
        ? "m4a"
        : mimeType.includes("ogg")
        ? "ogg"
        : "webm";

      const fileKey = `momentaufnahmen/${user.id}/${Date.now()}.${ext}`;
      const { url } = await storagePut(fileKey, req.file.buffer, mimeType);

      return res.json({ audioUrl: url, fileKey });
    } catch (err) {
      console.error("[AudioUpload] Fehler:", err);
      return res.status(500).json({ error: "Upload fehlgeschlagen" });
    }
  }
);

// Podcast-Audio-Upload (nur Admin, bis 200 MB)
router.post(
  "/api/podcast/upload",
  podcastUpload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "Nicht angemeldet" });
      }

      if (!user || (user as any).role !== "admin") {
        return res.status(403).json({ error: "Nur Admins erlaubt" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Keine Audio-Datei empfangen" });
      }

      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `podcast-audio/${Date.now()}_${safeName}`;
      const { url } = await storagePut(fileKey, req.file.buffer, "audio/mpeg");

      return res.json({ url, fileKey });
    } catch (err) {
      console.error("[PodcastUpload] Fehler:", err);
      return res.status(500).json({ error: "Upload fehlgeschlagen" });
    }
  }
);

// Wissenspool-Audio-Upload (nur Admin, bis 100 MB)
const wissenspoolUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

router.post(
  "/api/raum36/upload-audio",
  wissenspoolUpload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "Nicht angemeldet" });
      }
      if (!user || (user as any).role !== "admin") {
        return res.status(403).json({ error: "Nur Admins erlaubt" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Keine Audio-Datei empfangen" });
      }
      const suffix = Math.random().toString(36).substring(2, 10);
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `raum36/wissenspool/${Date.now()}-${suffix}-${safeName}`;
      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype || "audio/mpeg");
      return res.json({ audioUrl: url, fileKey });
    } catch (err) {
      console.error("[WissenspoolUpload] Fehler:", err);
      return res.status(500).json({ error: "Upload fehlgeschlagen" });
    }
  }
);

export default router;
