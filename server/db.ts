import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, trades, InsertTrade, Trade } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Trade Management Functions
 */

/**
 * Get all trades for a user, optionally filtered by date range
 */
export async function getUserTrades(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<Trade[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(trades).where(eq(trades.userId, userId));

  if (startDate && endDate) {
    query = db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          gte(trades.entryDate, startDate),
          lte(trades.entryDate, endDate)
        )
      );
  }

  return query.orderBy(desc(trades.entryDate));
}

/**
 * Get a single trade by ID
 */
export async function getTrade(id: number): Promise<Trade | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(trades).where(eq(trades.id, id));
  return result[0];
}

/**
 * Create a new trade
 */
export async function createTrade(data: InsertTrade): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trades).values(data);
  return (result as any).insertId || 0;
}

/**
 * Update an existing trade
 */
export async function updateTrade(
  id: number,
  data: Partial<InsertTrade>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(trades).set(data).where(eq(trades.id, id));
}

/**
 * Delete a trade
 */
export async function deleteTrade(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(trades).where(eq(trades.id, id));
}

/**
 * Get performance metrics for a user within a date range
 */
export async function getPerformanceMetrics(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<{
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnl: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
    };
  }

  const userTrades = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.userId, userId),
        gte(trades.entryDate, startDate),
        lte(trades.entryDate, endDate)
      )
    );

  const totalTrades = userTrades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnl: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
    };
  }

  let totalPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalWins = 0;
  let totalLosses = 0;

  userTrades.forEach((trade) => {
    const pnl = parseFloat(trade.pnl?.toString() || "0");
    totalPnl += pnl;

    if (pnl > 0) {
      winningTrades++;
      totalWins += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      totalLosses += Math.abs(pnl);
    }
  });

  const winRate = (winningTrades / totalTrades) * 100;
  const averageWin = winningTrades > 0 ? totalWins / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    totalPnl,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
  };
}
