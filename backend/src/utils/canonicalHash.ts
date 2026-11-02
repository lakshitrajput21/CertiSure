import crypto from 'crypto';

export interface CanonicalCertificateInput {
  documentId: string;
  holderName: string;
  holderEmail: string;
  title: string;
  type: string;
  institutionId: string;
  issueDate: string;
  expiryDate?: string | null;
  description: string;
  gradeOrScore?: string | null;
  signatoryName: string;
  signatoryTitle: string;
}

/**
 * Computes deterministic SHA-256 hash of canonical certificate data.
 * Used to verify that certificate fields have not been tampered with in the database.
 */
export function computeCanonicalCertificateHash(input: CanonicalCertificateInput): string {
  // Sort keys deterministically
  const canonicalPayload = {
    description: (input.description || '').trim(),
    documentId: (input.documentId || '').trim().toUpperCase(),
    expiryDate: input.expiryDate ? input.expiryDate.split('T')[0] : null,
    gradeOrScore: input.gradeOrScore ? input.gradeOrScore.trim() : null,
    holderEmail: (input.holderEmail || '').trim().toLowerCase(),
    holderName: (input.holderName || '').trim(),
    institutionId: (input.institutionId || '').trim(),
    issueDate: input.issueDate.split('T')[0],
    signatoryName: (input.signatoryName || '').trim(),
    signatoryTitle: (input.signatoryTitle || '').trim(),
    title: (input.title || '').trim(),
    type: (input.type || '').trim(),
  };

  const jsonString = JSON.stringify(canonicalPayload);
  return 'sha256:' + crypto.createHash('sha256').update(jsonString, 'utf8').digest('hex');
}
