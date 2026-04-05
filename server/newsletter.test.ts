import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  subscribeToNewsletter: vi.fn(),
  unsubscribeFromNewsletter: vi.fn(),
  listNewsletterSubscribers: vi.fn(),
  getNewsletterSubscriberCount: vi.fn(),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";
import { newsletterRouter } from "./routers/newsletter";
import { TRPCError } from "@trpc/server";

// Helper to create a mock caller context
function createCaller(user?: { id: number; role: "user" | "admin"; openId: string; name: string | null }) {
  return newsletterRouter.createCaller({
    user: user ?? null,
    req: {} as any,
    res: {} as any,
  });
}

describe("newsletter router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribe", () => {
    it("should subscribe a new email successfully", async () => {
      const mockSubscriber = {
        id: 1,
        email: "test@example.com",
        name: "Max Mustermann",
        source: "website",
        active: true,
        welcomeEmailSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.subscribeToNewsletter).mockResolvedValue(mockSubscriber);

      const caller = createCaller();
      const result = await caller.subscribe({
        email: "test@example.com",
        name: "Max Mustermann",
        source: "website",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Danke");
      expect(db.subscribeToNewsletter).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Max Mustermann",
        source: "website",
      });
    });

    it("should throw CONFLICT if email is already subscribed", async () => {
      vi.mocked(db.subscribeToNewsletter).mockRejectedValue(
        new Error("ALREADY_SUBSCRIBED")
      );

      const caller = createCaller();
      await expect(
        caller.subscribe({ email: "existing@example.com" })
      ).rejects.toThrow(TRPCError);
    });

    it("should reject invalid email addresses", async () => {
      const caller = createCaller();
      await expect(
        caller.subscribe({ email: "not-an-email" })
      ).rejects.toThrow();
    });

    it("should show reactivation message for previously unsubscribed users", async () => {
      const mockSubscriber = {
        id: 1,
        email: "test@example.com",
        name: null,
        source: "website",
        active: true,
        welcomeEmailSent: false,
        reactivated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.subscribeToNewsletter).mockResolvedValue(mockSubscriber as any);

      const caller = createCaller();
      const result = await caller.subscribe({ email: "test@example.com" });

      expect(result.reactivated).toBe(true);
      expect(result.message).toContain("Willkommen zurück");
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe an email successfully", async () => {
      vi.mocked(db.unsubscribeFromNewsletter).mockResolvedValue(undefined);

      const caller = createCaller();
      const result = await caller.unsubscribe({ email: "test@example.com" });

      expect(result.success).toBe(true);
      expect(db.unsubscribeFromNewsletter).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("count", () => {
    it("should return subscriber counts", async () => {
      vi.mocked(db.getNewsletterSubscriberCount).mockResolvedValue({
        active: 42,
        total: 50,
      });

      const caller = createCaller();
      const result = await caller.count();

      expect(result.active).toBe(42);
      expect(result.total).toBe(50);
    });
  });

  describe("list (admin only)", () => {
    it("should return subscribers list for admin users", async () => {
      const mockSubscribers = [
        {
          id: 1,
          email: "admin@example.com",
          name: "Admin User",
          source: "website",
          active: true,
          welcomeEmailSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(db.listNewsletterSubscribers).mockResolvedValue(mockSubscribers);

      const adminCaller = createCaller({
        id: 1,
        role: "admin",
        openId: "admin-open-id",
        name: "Admin",
      });

      const result = await adminCaller.list({ activeOnly: true });
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("admin@example.com");
    });

    it("should throw FORBIDDEN for non-admin users", async () => {
      const userCaller = createCaller({
        id: 2,
        role: "user",
        openId: "user-open-id",
        name: "Regular User",
      });

      await expect(
        userCaller.list({ activeOnly: true })
      ).rejects.toThrow(TRPCError);
    });

    it("should throw FORBIDDEN for unauthenticated requests", async () => {
      const unauthCaller = createCaller();
      await expect(
        unauthCaller.list({ activeOnly: true })
      ).rejects.toThrow();
    });
  });
});
