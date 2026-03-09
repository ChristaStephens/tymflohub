import { users, pageViews, adminSettings, type User, type UpsertUser, type InsertPageView } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, gte, and } from "drizzle-orm";

// Interface for storage operations
// blueprint:javascript_log_in_with_replit
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Analytics operations
  recordPageView(data: InsertPageView): Promise<void>;
  getPageViewStats(days: number): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    topPages: { path: string; views: number }[];
    dailyViews: { date: string; views: number }[];
  }>;
  
  // Admin settings
  getAdminSetting(key: string): Promise<string | undefined>;
  setAdminSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - blueprint:javascript_log_in_with_replit
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Analytics operations
  async recordPageView(data: InsertPageView): Promise<void> {
    await db.insert(pageViews).values(data);
  }

  async getPageViewStats(days: number): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    topPages: { path: string; views: number }[];
    dailyViews: { date: string; views: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total views
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDate));
    const totalViews = Number(totalResult[0]?.count || 0);

    // Get unique visitors (by session or IP hash)
    const uniqueResult = await db
      .select({ count: sql<number>`count(distinct coalesce(${pageViews.sessionId}, ${pageViews.ipHash}))` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDate));
    const uniqueVisitors = Number(uniqueResult[0]?.count || 0);

    // Get top pages
    const topPagesResult = await db
      .select({
        path: pageViews.path,
        views: sql<number>`count(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDate))
      .groupBy(pageViews.path)
      .orderBy(desc(sql`count(*)`))
      .limit(20);
    
    const topPages = topPagesResult.map(r => ({
      path: r.path,
      views: Number(r.views),
    }));

    // Get daily views
    const dailyResult = await db
      .select({
        date: sql<string>`date(${pageViews.createdAt})`,
        views: sql<number>`count(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDate))
      .groupBy(sql`date(${pageViews.createdAt})`)
      .orderBy(sql`date(${pageViews.createdAt})`);
    
    const dailyViews = dailyResult.map(r => ({
      date: String(r.date),
      views: Number(r.views),
    }));

    return { totalViews, uniqueVisitors, topPages, dailyViews };
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key));
    return setting?.value;
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    await db
      .insert(adminSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }
}

export const storage = new DatabaseStorage();
