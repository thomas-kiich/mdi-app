import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { notifyOwner } from "./notification";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Dekodiert den state-Parameter.
 * Format: base64(redirectUri) ODER base64(JSON{redirectUri, ref})
 */
function parseState(state: string): { redirectUri: string; refCode?: string } {
  try {
    const decoded = atob(state);
    // Versuche JSON-Format (neues Format mit ref-Code)
    try {
      const parsed = JSON.parse(decoded);
      if (parsed.redirectUri) return parsed;
    } catch {
      // Altes Format: nur redirectUri als plain string
    }
    return { redirectUri: decoded };
  } catch {
    return { redirectUri: "/" };
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Einladungscode verarbeiten (falls vorhanden)
      const { refCode } = parseState(state);
      if (refCode) {
        try {
          const user = await db.getUserByOpenId(userInfo.openId);
          if (user) {
            const ergebnis = await db.verarbeiteEinladungsCode({
              code: refCode,
              neuenUserId: user.id,
            });
            if (ergebnis) {
              const neuerName = userInfo.name ?? "Jemand";
              await notifyOwner({
                title: `🎉 Neue Einladung erfolgreich!`,
                content: `${neuerName} ist über deinen Einladungslink beigetreten. Du hast eine neue Verbindung geknüpft!`,
              });
              console.log(`[Referral] ${neuerName} eingeladen von User ${ergebnis.referrerId}`);
            }
          }
        } catch (refErr) {
          // Referral-Fehler sollen den Login nicht blockieren
          console.warn("[Referral] Fehler beim Verarbeiten des Einladungscodes:", refErr);
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Nach Login zur Momentaufnahme weiterleiten (mit Willkommens-Flag wenn neu)
      const isNewUser = !!(refCode); // Neuer User wenn über Einladungslink
      const redirectTarget = isNewUser ? "/momentaufnahme?willkommen=1" : "/";
      res.redirect(302, redirectTarget);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
