import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trades table for trading journal
export const trades = mysqlTable("trades", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  entryDate: timestamp("entryDate").notNull(),
  entryPrice: decimal("entryPrice", { precision: 10, scale: 4 }).notNull(),
  exitDate: timestamp("exitDate").notNull(),
  exitPrice: decimal("exitPrice", { precision: 10, scale: 4 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
  tradeType: mysqlEnum("tradeType", ["long", "short"]).notNull(),
  notes: text("notes"),
  tags: varchar("tags", { length: 255 }),
  pnl: decimal("pnl", { precision: 12, scale: 2 }),
  pnlPercent: decimal("pnlPercent", { precision: 8, scale: 4 }),
  imageUrls: text("imageUrls"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tradeTemplates = mysqlTable("tradeTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  tradeType: mysqlEnum("tradeType", ["long", "short"]).notNull(),
  riskPercent: decimal("riskPercent", { precision: 5, scale: 2 }),
  rewardPercent: decimal("rewardPercent", { precision: 5, scale: 2 }),
  notes: text("notes"),
  tags: varchar("tags", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradeTemplate = typeof tradeTemplates.$inferSelect;
export type InsertTradeTemplate = typeof tradeTemplates.$inferInsert;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;
