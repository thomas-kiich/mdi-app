import { describe, it, expect } from "vitest";
import { encryptField, decryptField, encryptObject, decryptObject } from "./_core/encryption";

describe("Field-Level Encryption", () => {
  describe("encryptField & decryptField", () => {
    it("should encrypt and decrypt a simple string", () => {
      const original = "test-value";
      const encrypted = encryptField(original);
      const decrypted = decryptField(encrypted);
      
      expect(encrypted).not.toBe(original);
      expect(decrypted).toBe(original);
    });

    it("should encrypt and decrypt a number", () => {
      const original = 42.5;
      const encrypted = encryptField(original);
      const decrypted = decryptField(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it("should encrypt and decrypt an object", () => {
      const original = { bolt: 20, mcp: 25, cp: 18 };
      const encrypted = encryptField(original);
      const decrypted = decryptField(encrypted);
      
      expect(decrypted).toEqual(original);
    });

    it("should encrypt and decrypt null", () => {
      const original = null;
      const encrypted = encryptField(original);
      const decrypted = decryptField(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it("should produce different ciphertexts for the same plaintext (due to random IV)", () => {
      const original = "same-value";
      const encrypted1 = encryptField(original);
      const encrypted2 = encryptField(original);
      
      expect(encrypted1).not.toBe(encrypted2);
      expect(decryptField(encrypted1)).toBe(original);
      expect(decryptField(encrypted2)).toBe(original);
    });

    it("should throw on invalid encrypted format", () => {
      const invalid = "not-a-valid-encrypted-value";
      
      expect(() => decryptField(invalid)).toThrow();
    });

    it("should throw on corrupted ciphertext", () => {
      const original = "test";
      const encrypted = encryptField(original);
      const parts = encrypted.split(":");
      
      // Corrupt the ciphertext
      const corrupted = `${parts[0]}:${parts[1]}:corrupted`;
      
      expect(() => decryptField(corrupted)).toThrow();
    });
  });

  describe("encryptObject & decryptObject", () => {
    it("should encrypt and decrypt multiple fields", () => {
      const original = {
        id: 1,
        userId: 100,
        bolt: 20,
        boltMcp: 25,
        anmerkungen: "Test notes",
        datum: "2026-05-14",
      };

      const fieldsToEncrypt = ["bolt", "boltMcp", "anmerkungen"] as const;
      const encrypted = encryptObject(original, fieldsToEncrypt);
      const decrypted = decryptObject(encrypted, fieldsToEncrypt);

      expect(encrypted.id).toBe(original.id);
      expect(encrypted.userId).toBe(original.userId);
      expect(encrypted.datum).toBe(original.datum);
      expect(encrypted.bolt).not.toBe(original.bolt);
      expect(encrypted.boltMcp).not.toBe(original.boltMcp);
      expect(encrypted.anmerkungen).not.toBe(original.anmerkungen);

      expect(decrypted).toEqual(original);
    });

    it("should handle null fields gracefully", () => {
      const original = {
        id: 1,
        bolt: null,
        anmerkungen: "Test",
      };

      const fieldsToEncrypt = ["bolt", "anmerkungen"] as const;
      const encrypted = encryptObject(original, fieldsToEncrypt);
      const decrypted = decryptObject(encrypted, fieldsToEncrypt);

      expect(decrypted.bolt).toBe(null);
      expect(decrypted.anmerkungen).toBe("Test");
    });

    it("should handle undefined fields gracefully", () => {
      const original = {
        id: 1,
        bolt: undefined,
        anmerkungen: "Test",
      };

      const fieldsToEncrypt = ["bolt", "anmerkungen"] as const;
      const encrypted = encryptObject(original, fieldsToEncrypt);
      const decrypted = decryptObject(encrypted, fieldsToEncrypt);

      expect(decrypted.bolt).toBe(undefined);
      expect(decrypted.anmerkungen).toBe("Test");
    });
  });

  describe("DSGVO Compliance", () => {
    it("should encrypt sensitive health data (BOLT measurements)", () => {
      const healthData = {
        userId: 123,
        bolt: 20,
        boltMcp: 25,
        boltCp: 18,
        ruhepuls: 60,
        hrv: 45,
        temperatur: "36.8",
        gewicht: "75",
        anmerkungen: "Feeling good today",
      };

      const sensitiveFields = ["bolt", "boltMcp", "boltCp", "ruhepuls", "hrv", "anmerkungen"] as const;
      const encrypted = encryptObject(healthData, sensitiveFields);

      // Verify sensitive fields are encrypted
      expect(typeof encrypted.bolt).toBe("string");
      expect(encrypted.bolt).toContain(":");
      expect(encrypted.bolt).not.toBe(healthData.bolt.toString());

      // Verify non-sensitive fields are not encrypted
      expect(encrypted.userId).toBe(healthData.userId);
      expect(encrypted.temperatur).toBe(healthData.temperatur);
      expect(encrypted.gewicht).toBe(healthData.gewicht);

      // Verify decryption works
      const decrypted = decryptObject(encrypted, sensitiveFields);
      expect(decrypted).toEqual(healthData);
    });
  });
});
