import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Device ID is passed from client to ensure data isolation per device
// This replaces the hardcoded LOCAL_USER_ID approach

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  trades: router({
    list: publicProcedure
      .input(z.object({ deviceId: z.string() }))
      .query(({ input }) => db.getUserTrades(parseInt(input.deviceId) || 1)),
    listByDateRange: publicProcedure
      .input(z.object({ deviceId: z.string(), startDate: z.date(), endDate: z.date() }))
      .query(({ input }) => db.getUserTrades(parseInt(input.deviceId) || 1, input.startDate, input.endDate)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTrade(input.id)),
    create: publicProcedure
      .input(
        z.object({
          deviceId: z.string(),
          symbol: z.string().min(1).max(20),
          entryDate: z.date(),
          entryTime: z.string().optional(),
          entryPrice: z.number().positive(),
          exitDate: z.date(),
          exitTime: z.string().optional(),
          exitPrice: z.number().positive(),
          stoploss: z.number().optional(),
          quantity: z.number().positive(),
          tradeType: z.enum(["long", "short"]),
          notes: z.string().optional(),
          journalEntry: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const pnl = input.tradeType === "long"
          ? (input.exitPrice - input.entryPrice) * input.quantity
          : (input.entryPrice - input.exitPrice) * input.quantity;
        const pnlPercent = ((input.exitPrice - input.entryPrice) / input.entryPrice) * 100;
        return db.createTrade({
          userId: parseInt(input.deviceId) || 1,
          symbol: input.symbol,
          entryDate: input.entryDate,
          entryTime: input.entryTime,
          entryPrice: input.entryPrice.toString(),
          exitDate: input.exitDate,
          exitTime: input.exitTime,
          exitPrice: input.exitPrice.toString(),
          stoploss: input.stoploss?.toString(),
          quantity: input.quantity.toString(),
          tradeType: input.tradeType,
          notes: input.notes,
          journalEntry: input.journalEntry,
          tags: input.tags,
          pnl: pnl.toString(),
          pnlPercent: pnlPercent.toString(),
        });
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          symbol: z.string().min(1).max(20).optional(),
          entryDate: z.date().optional(),
          entryPrice: z.number().positive().optional(),
          exitDate: z.date().optional(),
          exitPrice: z.number().positive().optional(),
          quantity: z.number().positive().optional(),
          tradeType: z.enum(["long", "short"]).optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const updateData: any = {};
        if (input.symbol !== undefined) updateData.symbol = input.symbol;
        if (input.entryDate !== undefined) updateData.entryDate = input.entryDate;
        if (input.entryPrice !== undefined) updateData.entryPrice = input.entryPrice.toString();
        if (input.exitDate !== undefined) updateData.exitDate = input.exitDate;
        if (input.exitPrice !== undefined) updateData.exitPrice = input.exitPrice.toString();
        if (input.quantity !== undefined) updateData.quantity = input.quantity.toString();
        if (input.tradeType !== undefined) updateData.tradeType = input.tradeType;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.tags !== undefined) updateData.tags = input.tags;
        if (input.entryPrice && input.exitPrice && input.quantity && input.tradeType) {
          const pnl = input.tradeType === "long"
            ? (input.exitPrice - input.entryPrice) * input.quantity
            : (input.entryPrice - input.exitPrice) * input.quantity;
          const pnlPercent = ((input.exitPrice - input.entryPrice) / input.entryPrice) * 100;
          updateData.pnl = pnl.toString();
          updateData.pnlPercent = pnlPercent.toString();
        }
        return db.updateTrade(input.id, updateData);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTrade(input.id)),
    getMetrics: publicProcedure
      .input(z.object({ deviceId: z.string(), startDate: z.date(), endDate: z.date() }))
      .query(({ input }) => db.getPerformanceMetrics(parseInt(input.deviceId) || 1, input.startDate, input.endDate)),
  }),
});

export type AppRouter = typeof appRouter;
