export type CertificateStatus = 'VALID' | 'REVOKED' | 'EXPIRED' | 'INTEGRITY_FAILED';

export type CertificateType =
  | 'Degree'
  | 'Diploma'
  | 'Course Completion'
  | 'Academic Merit'
  | 'Professional License'
  | 'Internship Credential';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: 'ISSUED' | 'VERIFIED' | 'REVOKED' | 'MODIFIED' | 'VIEWED';
  actor: string;
  notes?: string;
  ipAddress?: string;
}

export interface Certificate {
  id: string; // e.g. CS-2024-88491
  holderName: string;
  holderEmail: string;
  title: string;
  type: CertificateType;
  institutionName: string;
  institutionId: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD (optional)
  status: CertificateStatus;
  description: string;
  gradeOrScore?: string;
  signatoryName: string;
  signatoryTitle: string;
  digitalFingerprint: string; // Simulated SHA-256 hash
  revocationReason?: string;
  revocationDate?: string;
  auditTrail: AuditEvent[];
  createdAt: string;
}

export interface CertificateIssueInput {
  holderName: string;
  holderEmail: string;
  title: string;
  type: CertificateType;
  issueDate: string;
  expiryDate?: string;
  description: string;
  gradeOrScore?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}
