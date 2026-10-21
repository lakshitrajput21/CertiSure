import { VerificationLog, VerificationMethod, VerificationResult } from '../types/verification';
import { storageService } from './storageService';
import { certificateService } from './certificateService';
import { isPastDate } from '../utils/dateUtils';

export class VerificationService {
  async verifyCertificate(
    id: string,
    method: VerificationMethod = 'DIRECT_SEARCH'
  ): Promise<VerificationResult> {
    const cleanId = id.trim().toUpperCase();
    const certificate = await certificateService.getCertificateById(cleanId);
    const nowIso = new Date().toISOString();

    if (!certificate) {
      // Log not found event
      const logEntry: VerificationLog = {
        id: `ver-${Date.now()}`,
        timestamp: nowIso,
        certificateId: cleanId,
        certificateTitle: 'Unknown Document',
        holderName: 'Unknown',
        institutionName: 'Unknown',
        outcome: 'NOT_FOUND',
        method,
        ipLocation: 'Chandigarh, India (Simulated)',
        notes: 'Record not found in institutional repository.',
      };
      this.recordVerificationLog(logEntry);

      return {
        outcome: 'NOT_FOUND',
        searchedId: cleanId,
        verifiedAt: nowIso,
        method,
      };
    }

    // Determine outcome
    let outcome = certificate.status;

    // Check expiration if not marked expired already
    if (outcome === 'VALID' && certificate.expiryDate && isPastDate(certificate.expiryDate)) {
      outcome = 'EXPIRED';
    }

    // Append to certificate audit trail
    const updatedAudit = [
      {
        id: `aud-${Date.now()}-ver`,
        timestamp: nowIso,
        action: 'VERIFIED' as const,
        actor: `Public Verifier (${method.replace('_', ' ')})`,
        notes: `Verification query returned status: ${outcome}`,
        ipAddress: '14.139.227.12',
      },
      ...certificate.auditTrail,
    ];

    const currentList = storageService.getCertificates();
    const idx = currentList.findIndex((c) => c.id === certificate.id);
    if (idx !== -1) {
      currentList[idx] = {
        ...currentList[idx],
        status: outcome,
        auditTrail: updatedAudit,
      };
      storageService.setCertificates([...currentList]);
    }

    // Record verification history log
    const logEntry: VerificationLog = {
      id: `ver-${Date.now()}`,
      timestamp: nowIso,
      certificateId: certificate.id,
      certificateTitle: certificate.title,
      holderName: certificate.holderName,
      institutionName: certificate.institutionName,
      outcome,
      method,
      ipLocation: 'Chandigarh, India (Simulated)',
      notes: `Institutional status check returned ${outcome}.`,
    };
    this.recordVerificationLog(logEntry);

    return {
      outcome,
      searchedId: cleanId,
      certificate: { ...certificate, status: outcome, auditTrail: updatedAudit },
      verifiedAt: nowIso,
      method,
      tamperDetails:
        outcome === 'INTEGRITY_FAILED'
          ? 'Warning: Simulated checksum hash failure. The recorded cryptographic fingerprint failed mathematical consistency validation against issuing authority public key.'
          : undefined,
    };
  }

  async getVerificationLogs(): Promise<VerificationLog[]> {
    return storageService.getVerifications();
  }

  private recordVerificationLog(entry: VerificationLog): void {
    const logs = storageService.getVerifications();
    storageService.setVerifications([entry, ...logs]);
  }
}

export const verificationService = new VerificationService();
