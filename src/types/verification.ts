import { CertificateStatus } from './certificate';

export type VerificationMethod = 'QR_CODE' | 'DIRECT_SEARCH' | 'URL_LOOKUP' | 'API_DEMO';

export type VerificationOutcome = CertificateStatus | 'NOT_FOUND';

export interface VerificationLog {
  id: string;
  timestamp: string;
  certificateId: string;
  certificateTitle?: string;
  holderName?: string;
  institutionName?: string;
  outcome: VerificationOutcome;
  method: VerificationMethod;
  ipLocation?: string;
  notes?: string;
}

export interface VerificationResult {
  outcome: VerificationOutcome;
  searchedId: string;
  certificate?: import('./certificate').Certificate;
  verifiedAt: string;
  method: VerificationMethod;
  tamperDetails?: string;
}
