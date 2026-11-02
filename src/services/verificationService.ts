import { VerificationLog, VerificationMethod, VerificationResult } from '../types/verification';
import { api } from './apiClient';
class VerificationService {
  async verifyCertificate(id: string, method: VerificationMethod = 'DIRECT_SEARCH'): Promise<VerificationResult> {
    const cleanId = id.trim().toUpperCase();
    // The verification endpoint deliberately returns HTTP 404 for NOT_FOUND; preserve its response.
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/verify/${encodeURIComponent(cleanId)}?method=${method}`);
    const result = await response.json();
    if (!response.ok && result.outcome !== 'NOT_FOUND') throw new Error(result.error?.message || 'Verification failed');
    return { ...result, outcome: result.outcome === 'INTEGRITY_NOT_CHECKED' ? 'INTEGRITY_FAILED' : result.outcome, searchedId: cleanId, verifiedAt: result.verifiedAt || new Date().toISOString(), method };
  }
  async getVerificationLogs(): Promise<VerificationLog[]> {
    const { logs } = await api<{ logs: Array<VerificationLog & { searchedId?: string; createdAt?: string }> }>('/verify?limit=100');
    return logs.map(log => ({ ...log, certificateId: log.certificateId || log.searchedId || '', timestamp: log.timestamp || log.createdAt || '' }));
  }
}
export const verificationService = new VerificationService();
