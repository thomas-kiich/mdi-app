/**
 * Newsletter DSGVO Tests
 *
 * Testet: Double-Opt-In, Bestätigung, Abmeldung per Token,
 * Datenlöschung (Art. 17 DSGVO) und Einwilligungsnachweis (Art. 7 DSGVO).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  subscribeToNewsletter: vi.fn(),
  confirmNewsletterSubscription: vi.fn(),
  unsubscribeFromNewsletter: vi.fn(),
  deleteNewsletterData: vi.fn(),
  listNewsletterSubscribers: vi.fn(),
  getNewsletterSubscriberCount: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";
import { newsletterRouter } from "./routers/newsletter";
import { TRPCError } from "@trpc/server";

// ─── Hilfsfunktion ────────────────────────────────────────────────────────────
function createCaller(user?: { id: number; role: "user" | "admin"; openId: string; name: string | null }) {
  return newsletterRouter.createCaller({
    user: user ?? null,
    req: { headers: {}, socket: {} } as any,
    res: {} as any,
  });
}

const mockSubscriber = {
  id: 1,
  email: "test@example.com",
  name: "Max Mustermann",
  source: "website",
  active: false, // DSGVO: erst nach Bestätigung aktiv
  confirmToken: "confirm-abc123",
  confirmedAt: null,
  deleteToken: "delete-xyz789",
  signupIp: "127.0.0.1",
  welcomeEmailSent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("newsletter.subscribe – Double-Opt-In Schritt 1", () => {
  beforeEach(() => vi.clearAllMocks());

  it("erstellt inaktiven Eintrag und gibt Bestätigungshinweis zurück", async () => {
    vi.mocked(db.subscribeToNewsletter).mockResolvedValue(mockSubscriber);

    const caller = createCaller();
    const result = await caller.subscribe({
      email: "test@example.com",
      name: "Max Mustermann",
      source: "website",
      origin: "https://kiich.manus.space",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("best");
  });

  it("wirft CONFLICT wenn E-Mail bereits aktiv angemeldet ist", async () => {
    vi.mocked(db.subscribeToNewsletter).mockRejectedValue(new Error("ALREADY_SUBSCRIBED"));

    const caller = createCaller();
    await expect(
      caller.subscribe({ email: "existing@example.com" })
    ).rejects.toThrow(TRPCError);
  });

  it("lehnt ungültige E-Mail-Adressen ab", async () => {
    const caller = createCaller();
    await expect(
      caller.subscribe({ email: "keine-email" })
    ).rejects.toThrow();
  });
});

describe("newsletter.confirm – Double-Opt-In Schritt 2", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bestätigt Anmeldung mit gültigem Token", async () => {
    const confirmed = { ...mockSubscriber, active: true, confirmedAt: new Date(), confirmToken: null };
    vi.mocked(db.confirmNewsletterSubscription).mockResolvedValue(confirmed);

    const caller = createCaller();
    const result = await caller.confirm({ token: "confirm-abc123" });

    expect(result.success).toBe(true);
  });

  it("wirft NOT_FOUND bei ungültigem Token", async () => {
    vi.mocked(db.confirmNewsletterSubscription).mockRejectedValue(new Error("INVALID_TOKEN"));

    const caller = createCaller();
    await expect(caller.confirm({ token: "ungültig" })).rejects.toThrow(TRPCError);
  });

  it("gibt Erfolg zurück wenn bereits bestätigt", async () => {
    vi.mocked(db.confirmNewsletterSubscription).mockRejectedValue(new Error("ALREADY_CONFIRMED"));

    const caller = createCaller();
    const result = await caller.confirm({ token: "confirm-abc123" });
    expect(result.success).toBe(true);
  });
});

describe("newsletter.unsubscribe – Abmeldung per Token", () => {
  beforeEach(() => vi.clearAllMocks());

  it("meldet Abonnenten per Token ab", async () => {
    vi.mocked(db.unsubscribeFromNewsletter).mockResolvedValue({ email: "test@example.com" });

    const caller = createCaller();
    const result = await caller.unsubscribe({ token: "delete-xyz789" });

    expect(result.success).toBe(true);
  });

  it("wirft NOT_FOUND bei ungültigem Token", async () => {
    vi.mocked(db.unsubscribeFromNewsletter).mockRejectedValue(new Error("INVALID_TOKEN"));

    const caller = createCaller();
    await expect(caller.unsubscribe({ token: "ungültig" })).rejects.toThrow(TRPCError);
  });
});

describe("newsletter.deleteData – Datenlöschung Art. 17 DSGVO", () => {
  beforeEach(() => vi.clearAllMocks());

  it("löscht alle Daten vollständig per Token", async () => {
    vi.mocked(db.deleteNewsletterData).mockResolvedValue({ email: "test@example.com" });

    const caller = createCaller();
    const result = await caller.deleteData({ token: "delete-xyz789" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("gelöscht");
  });

  it("wirft NOT_FOUND bei ungültigem Token", async () => {
    vi.mocked(db.deleteNewsletterData).mockRejectedValue(new Error("INVALID_TOKEN"));

    const caller = createCaller();
    await expect(caller.deleteData({ token: "ungültig" })).rejects.toThrow(TRPCError);
  });
});

describe("newsletter.count – Öffentliche Statistik", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gibt aktive und Gesamt-Abonnentenzahl zurück", async () => {
    vi.mocked(db.getNewsletterSubscriberCount).mockResolvedValue({ active: 42, total: 50 });

    const caller = createCaller();
    const result = await caller.count();

    expect(result.active).toBe(42);
    expect(result.total).toBe(50);
  });
});

describe("newsletter.list – Admin-Zugriff", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gibt Abonnentenliste für Admin zurück", async () => {
    vi.mocked(db.listNewsletterSubscribers).mockResolvedValue([mockSubscriber]);

    const adminCaller = createCaller({ id: 1, role: "admin", openId: "admin-id", name: "Admin" });
    const result = await adminCaller.list({ activeOnly: true });

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("test@example.com");
  });

  it("wirft FORBIDDEN für normale Nutzer", async () => {
    const userCaller = createCaller({ id: 2, role: "user", openId: "user-id", name: "Nutzer" });
    await expect(userCaller.list({ activeOnly: true })).rejects.toThrow(TRPCError);
  });

  it("wirft Fehler für nicht authentifizierte Anfragen", async () => {
    const unauthCaller = createCaller();
    await expect(unauthCaller.list({ activeOnly: true })).rejects.toThrow();
  });
});
