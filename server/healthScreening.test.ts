import { describe, it, expect } from "vitest";
import {
  evaluateHealthScreening,
  type HealthScreeningInput,
} from "./_core/healthScreening";

describe("Health Screening", () => {
  describe("evaluateHealthScreening", () => {
    const baseInput: HealthScreeningInput = {
      userId: 1,
      hasHighBloodPressure: false,
      hasAsthma: false,
      hasHeartArrhythmia: false,
      hasEpilepsy: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasAnxietyDisorder: false,
      hasDepression: false,
      hasSleepDisorder: false,
      hasMentalIllness: false,
      hasSubstanceAbuse: false,
      disclaimerAccepted: true,
    };

    it("should approve screening with no contraindications", () => {
      const result = evaluateHealthScreening(baseInput);

      expect(result.approved).toBe(true);
      expect(result.status).toBe("approved");
      expect(result.reason).toBe("Keine Kontraindikationen");
    });

    it("should reject if disclaimer not accepted", () => {
      const input = { ...baseInput, disclaimerAccepted: false };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.reason).toBe("Haftungsausschluss nicht akzeptiert");
    });

    it("should exclude user with high blood pressure", () => {
      const input = { ...baseInput, hasHighBloodPressure: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Bluthochdruck");
    });

    it("should exclude user with asthma", () => {
      const input = { ...baseInput, hasAsthma: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Asthma");
    });

    it("should exclude user with heart arrhythmia", () => {
      const input = { ...baseInput, hasHeartArrhythmia: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Herzrhythmusstörungen");
    });

    it("should exclude user with epilepsy", () => {
      const input = { ...baseInput, hasEpilepsy: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Epilepsie");
    });

    it("should exclude pregnant user", () => {
      const input = { ...baseInput, isPregnant: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Schwangerschaft");
    });

    it("should exclude user with recent surgery", () => {
      const input = { ...baseInput, hasRecentSurgery: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Kürzliche Operation");
    });

    it("should require attestation for anxiety disorder", () => {
      const input = { ...baseInput, hasAnxietyDisorder: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });

    it("should require attestation for depression", () => {
      const input = { ...baseInput, hasDepression: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });

    it("should require attestation for sleep disorder", () => {
      const input = { ...baseInput, hasSleepDisorder: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });

    it("should require attestation for mental illness", () => {
      const input = { ...baseInput, hasMentalIllness: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });

    it("should require attestation for substance abuse", () => {
      const input = { ...baseInput, hasSubstanceAbuse: true };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });

    it("should exclude physical contraindications even with mental health conditions", () => {
      const input = {
        ...baseInput,
        hasHighBloodPressure: true,
        hasDepression: true,
      };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("excluded_physical");
      expect(result.excludedReasons).toContain("Bluthochdruck");
      expect(result.excludedReasons).not.toContain("Depression");
    });

    it("should collect multiple exclusion reasons", () => {
      const input = {
        ...baseInput,
        hasHighBloodPressure: true,
        hasAsthma: true,
        hasEpilepsy: true,
      };
      const result = evaluateHealthScreening(input);

      expect(result.approved).toBe(false);
      expect(result.excludedReasons).toHaveLength(3);
      expect(result.excludedReasons).toContain("Bluthochdruck");
      expect(result.excludedReasons).toContain("Asthma");
      expect(result.excludedReasons).toContain("Epilepsie");
    });
  });

  describe("DSGVO Compliance", () => {
    it("should mark screening as requiring attestation for mental health conditions", () => {
      const input: HealthScreeningInput = {
        userId: 1,
        hasHighBloodPressure: false,
        hasAsthma: false,
        hasHeartArrhythmia: false,
        hasEpilepsy: false,
        isPregnant: false,
        hasRecentSurgery: false,
        hasAnxietyDisorder: true, // Mental health condition
        hasDepression: false,
        hasSleepDisorder: false,
        hasMentalIllness: false,
        hasSubstanceAbuse: false,
        disclaimerAccepted: true,
      };

      const result = evaluateHealthScreening(input);

      expect(result.status).toBe("pending_attestation");
      expect(result.requiresAttestation).toBe(true);
    });
  });
});
