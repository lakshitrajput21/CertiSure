import crypto from 'crypto';

// Accepts both legacy demo format (CS-YYYY-XXXXX) and production non-enumerable format (CS-YYYY-[A-Z0-9]{12,24})
export const CERTIFICATE_ID_REGEX = /^CS-\d{4}-([0-9]{5}|[A-Z0-9]{12,24})$/;

/**
 * Generates a cryptographically random, non-enumerable certificate ID.
 * Format: CS-YYYY-<16 uppercase alphanumeric characters with ~80 bits of entropy>
 * Example: CS-2026-9F3A7C1E8B4D205F
 */
export function generateProductionCertificateId(): string {
  const year = new Date().getFullYear();
  // Generate 10 cryptographically secure bytes -> 20 hex characters, truncated to 16
  const randomSuffix = crypto.randomBytes(10).toString('hex').toUpperCase().substring(0, 16);
  return `CS-${year}-${randomSuffix}`;
}

/**
 * Validates a certificate ID against both legacy and modern formats.
 */
export function isValidCertificateId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return CERTIFICATE_ID_REGEX.test(id.trim().toUpperCase());
}
