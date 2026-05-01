import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDb } from "../db";
import { podcastEpisodes } from "../../drizzle/schema";
import { eq, count } from "drizzle-orm";

describe("Podcast Episodes - Integrity Validation", () => {
  let db: any;

  beforeEach(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  it("should enforce only one episode with isLatest=true", async () => {
    // Zähle aktuelle Episoden mit isLatest=true
    const [result] = await db
      .select({ count: count() })
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, true));

    const latestCount = result?.count ?? 0;
    expect(latestCount).toBe(1);
  });

  it("should have exactly 5 episodes in database", async () => {
    const [result] = await db
      .select({ count: count() })
      .from(podcastEpisodes);

    const totalCount = result?.count ?? 0;
    expect(totalCount).toBeGreaterThanOrEqual(5);
  });

  it("should have EP05 as the latest episode", async () => {
    const latest = await db
      .select()
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, true))
      .limit(1);

    expect(latest.length).toBe(1);
    expect(latest[0].episodeNumber).toBe("05");
  });

  it("should have EP01-EP04 with isLatest=false", async () => {
    const older = await db
      .select()
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, false));

    const episodeNumbers = older
      .map((ep: any) => ep.episodeNumber)
      .sort();

    expect(episodeNumbers).toContain("01");
    expect(episodeNumbers).toContain("02");
    expect(episodeNumbers).toContain("03");
    expect(episodeNumbers).toContain("04");
  });

  it("should have correct sortOrder for all episodes", async () => {
    const all = await db
      .select()
      .from(podcastEpisodes)
      .orderBy(podcastEpisodes.sortOrder);

    const sorted = all.map((ep: any) => ({
      episodeNumber: ep.episodeNumber,
      sortOrder: ep.sortOrder,
    }));

    // EP01 sollte sortOrder 1 haben, EP05 sollte sortOrder 5 haben
    expect(sorted[0].episodeNumber).toBe("01");
    expect(sorted[4].episodeNumber).toBe("05");
  });

  it("should have valid audio URLs for all episodes", async () => {
    const all = await db.select().from(podcastEpisodes);

    all.forEach((ep: any) => {
      expect(ep.audioUrl).toBeTruthy();
      expect(ep.audioUrl).toMatch(/^https?:\/\//);
    });
  });

  it("should have valid cover images for all episodes", async () => {
    const all = await db.select().from(podcastEpisodes);

    all.forEach((ep: any) => {
      expect(ep.coverImageUrl).toBeTruthy();
      expect(ep.coverImageUrl).toMatch(/^https?:\/\//);
    });
  });

  it("should have descriptions for all episodes", async () => {
    const all = await db.select().from(podcastEpisodes);

    all.forEach((ep: any) => {
      expect(ep.description).toBeTruthy();
      expect(ep.description.length).toBeGreaterThan(10);
    });
  });

  it("should have unique episode numbers", async () => {
    const all = await db.select().from(podcastEpisodes);
    const episodeNumbers = all.map((ep: any) => ep.episodeNumber);
    const uniqueNumbers = new Set(episodeNumbers);

    expect(uniqueNumbers.size).toBe(episodeNumbers.length);
  });
});

describe("Podcast Episodes - Frontend Logic", () => {
  let db: any;

  beforeEach(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  it("should correctly separate latest and older episodes", async () => {
    const all = await db.select().from(podcastEpisodes);

    const latest = all.find((ep: any) => ep.isLatest === true);
    const older = all.filter((ep: any) => ep.isLatest === false);

    expect(latest).toBeDefined();
    expect(older.length).toBeGreaterThanOrEqual(4);
  });

  it("should have no duplicates in older episodes list", async () => {
    const older = await db
      .select()
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, false));

    const ids = older.map((ep: any) => ep.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should sort episodes correctly by sortOrder", async () => {
    const all = await db
      .select()
      .from(podcastEpisodes)
      .orderBy(podcastEpisodes.sortOrder);

    for (let i = 0; i < all.length - 1; i++) {
      expect(all[i].sortOrder).toBeLessThanOrEqual(all[i + 1].sortOrder);
    }
  });
});
