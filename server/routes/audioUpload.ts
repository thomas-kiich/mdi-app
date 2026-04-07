/**
 * Express-Route für direkten Audio-Upload (multipart/form-data).
 * Umgeht die Base64-Limitierung von tRPC JSON.
 *
 * POST /api/audio/upload
 * Content-Type: multipart/form-data
 * Body: audio (Blob), mimeType (string)
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

router.post(
  "/api/audio/upload",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      // Auth prüfen
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

export default router;
