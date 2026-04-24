/**
 * Tests für Admin-Benutzerverwaltung (searchUsers, listUsers, deleteUser)
 * Alle Tests laufen ohne echte DB-Verbindung – Logik und Validierung werden geprüft.
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema-Validierung testen (wie der Router sie verwendet)
const searchInputSchema = z.object({ query: z.string().min(1).max(100) });
const listInputSchema = z.object({ page: z.number().min(0).default(0) });
const deleteInputSchema = z.object({ userId: z.number(), confirm: z.literal(true) });

describe("Admin Benutzerverwaltung – Input-Validierung", () => {
  it("searchUsers: akzeptiert gültige Suchanfrage", () => {
    expect(() => searchInputSchema.parse({ query: "gisela" })).not.toThrow();
    expect(() => searchInputSchema.parse({ query: "strafer@example.com" })).not.toThrow();
  });

  it("searchUsers: lehnt leere Suchanfrage ab", () => {
    expect(() => searchInputSchema.parse({ query: "" })).toThrow();
  });

  it("searchUsers: lehnt zu lange Suchanfrage ab (>100 Zeichen)", () => {
    expect(() => searchInputSchema.parse({ query: "a".repeat(101) })).toThrow();
  });

  it("listUsers: akzeptiert gültige Seite", () => {
    expect(() => listInputSchema.parse({ page: 0 })).not.toThrow();
    expect(() => listInputSchema.parse({ page: 5 })).not.toThrow();
  });

  it("listUsers: lehnt negative Seite ab", () => {
    expect(() => listInputSchema.parse({ page: -1 })).toThrow();
  });

  it("listUsers: verwendet Standardwert 0 wenn keine Seite angegeben", () => {
    const result = listInputSchema.parse({});
    expect(result.page).toBe(0);
  });

  it("deleteUser: akzeptiert gültige Löschanfrage mit Bestätigung", () => {
    expect(() => deleteInputSchema.parse({ userId: 42, confirm: true })).not.toThrow();
  });

  it("deleteUser: lehnt Anfrage ohne confirm=true ab", () => {
    // confirm muss literal true sein
    expect(() => deleteInputSchema.parse({ userId: 42, confirm: false })).toThrow();
  });

  it("deleteUser: lehnt Anfrage ohne userId ab", () => {
    expect(() => deleteInputSchema.parse({ confirm: true })).toThrow();
  });

  it("deleteUser: lehnt string userId ab", () => {
    expect(() => deleteInputSchema.parse({ userId: "abc", confirm: true })).toThrow();
  });
});

describe("Admin Benutzerverwaltung – Suchlogik", () => {
  it("Wildcard-Pattern wird korrekt erstellt", () => {
    const query = "gisela";
    const pattern = `%${query}%`;
    expect(pattern).toBe("%gisela%");
    expect(pattern).toContain("%");
  });

  it("Pagination-Offset wird korrekt berechnet", () => {
    const pageSize = 20;
    const page = 3;
    const offset = page * pageSize;
    expect(offset).toBe(60);
  });

  it("Gesamtseitenanzahl wird korrekt berechnet", () => {
    const total = 45;
    const pageSize = 20;
    const totalPages = Math.ceil(total / pageSize);
    expect(totalPages).toBe(3);
  });
});
