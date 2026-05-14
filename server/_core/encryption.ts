import crypto from "crypto";

/**
 * Field-Level Encryption für sensible Gesundheitsdaten (BOLT, Vitalmonitor)
 * 
 * Verwendet AES-256-GCM für authenticated encryption.
 * Jeder Wert hat seinen eigenen IV (Initialization Vector) für maximale Sicherheit.
 * 
 * DSGVO Art. 32: Technische Maßnahmen zur Verschlüsselung personenbezogener Daten
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";

/**
 * Verschlüsselt einen Wert mit AES-256-GCM
 * @param value Der zu verschlüsselnde Wert (wird zu JSON stringifiziert)
 * @returns Verschlüsselter Wert im Format: iv:authTag:encryptedData (hex-kodiert)
 */
export function encryptField(value: any): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    
    const jsonString = JSON.stringify(value);
    let encrypted = cipher.update(jsonString, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("[Encryption] Error encrypting field:", error);
    throw new Error("Field encryption failed");
  }
}

/**
 * Entschlüsselt einen verschlüsselten Wert
 * @param encryptedValue Verschlüsselter Wert im Format: iv:authTag:encryptedData
 * @returns Der ursprüngliche Wert (geparst aus JSON)
 */
export function decryptField(encryptedValue: string): any {
  try {
    const parts = encryptedValue.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted format");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("[Encryption] Error decrypting field:", error);
    throw new Error("Field decryption failed");
  }
}

/**
 * Verschlüsselt mehrere Felder eines Objekts
 * @param obj Das Objekt
 * @param fieldsToEncrypt Array von Feldnamen, die verschlüsselt werden sollen
 * @returns Neues Objekt mit verschlüsselten Feldern
 */
export function encryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encrypted = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (field in encrypted && encrypted[field] !== null && encrypted[field] !== undefined) {
      (encrypted[field] as any) = encryptField(encrypted[field]);
    }
  }
  
  return encrypted;
}

/**
 * Entschlüsselt mehrere Felder eines Objekts
 * @param obj Das Objekt mit verschlüsselten Feldern
 * @param fieldsToDecrypt Array von Feldnamen, die entschlüsselt werden sollen
 * @returns Neues Objekt mit entschlüsselten Feldern
 */
export function decryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const decrypted = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (field in decrypted && typeof decrypted[field] === "string") {
      try {
        (decrypted[field] as any) = decryptField(decrypted[field] as string);
      } catch (error) {
        console.error(`[Encryption] Failed to decrypt field ${String(field)}:`, error);
        // Feld bleibt verschlüsselt wenn Entschlüsselung fehlschlägt
      }
    }
  }
  
  return decrypted;
}

/**
 * Validiert, ob der ENCRYPTION_KEY korrekt gesetzt ist
 */
export function validateEncryptionKey(): boolean {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(
      "[Encryption] ENCRYPTION_KEY not set in environment. Using random key (data will be unrecoverable on restart!)"
    );
    return false;
  }
  
  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    if (key.length !== 32) {
      throw new Error("Key must be 32 bytes (256 bits)");
    }
    return true;
  } catch (error) {
    console.error("[Encryption] Invalid ENCRYPTION_KEY format:", error);
    return false;
  }
}
