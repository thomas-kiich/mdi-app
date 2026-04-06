import { describe, it, expect } from "vitest";
import { testBrevoConnection } from "./brevo";

describe("Brevo API", () => {
  it("sollte sich erfolgreich mit dem Brevo-Account verbinden", async () => {
    const connected = await testBrevoConnection();
    expect(connected).toBe(true);
  }, 10000);
});
