import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Cookie-Refresh: Bei jedem authentifizierten Request das Cookie erneuern.
  //
  // Hintergrund: iOS Safari ITP (Intelligent Tracking Prevention) löscht
  // Cookies von Websites, die nicht als PWA installiert sind, nach 7 Tagen
  // Inaktivität – unabhängig vom ursprünglichen maxAge. Durch das Erneuern
  // des Cookies bei jedem API-Call wird der 7-Tage-Timer zurückgesetzt,
  // solange der Nutzer die App aktiv nutzt.
  //
  // Quelle: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
  if (user) {
    try {
      const existingCookie = opts.req.cookies?.[COOKIE_NAME];
      if (existingCookie) {
        const cookieOptions = getSessionCookieOptions(opts.req);
        opts.res.cookie(COOKIE_NAME, existingCookie, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
      }
    } catch {
      // Cookie-Refresh-Fehler sollen den Request nicht blockieren
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
