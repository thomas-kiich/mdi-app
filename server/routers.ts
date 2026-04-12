import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { newsletterRouter } from "./routers/newsletter";
import { momentaufnahmeRouter } from "./routers/momentaufnahme";
import { apiTokensRouter } from "./routers/apiTokens";
import { premiumRouter } from "./routers/premium";
import { profilRouter } from "./routers/profil";
import { einschlafBibliothekRouter } from "./routers/einschlafBibliothek";
import { adminTtsRouter } from "./routers/adminTts";
import { referralRouter } from "./routers/referral";
import { faqRouter } from "./routers/faq";
import { aboRouter } from "./routers/abo";
import { kontaktRouter } from "./routers/kontakt";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  newsletter: newsletterRouter,
  momentaufnahme: momentaufnahmeRouter,
  apiTokens: apiTokensRouter,
  premium: premiumRouter,
  profil: profilRouter,
  einschlafBibliothek: einschlafBibliothekRouter,
  adminTts: adminTtsRouter,
  referral: referralRouter,
  faq: faqRouter,
  abo: aboRouter,
  kontakt: kontaktRouter,
});

export type AppRouter = typeof appRouter;
