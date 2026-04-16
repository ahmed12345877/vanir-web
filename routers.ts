import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { bookingsRouter } from "./routers/bookings";
import { reviewsRouter } from "./routers/reviews";
import { offersRouter } from "./routers/offers";
import { contactRouter } from "./routers/contact";
import { uploadsRouter } from "./routers/uploads";

export const appRouter = router({
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

  // Feature routers
  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
});

export type AppRouter = typeof appRouter;
