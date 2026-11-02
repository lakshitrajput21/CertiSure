import { Certificate, CertificateIssueInput } from '../types/certificate';
import { api } from './apiClient';

export interface DashboardStats {
  total: number; active: number; revoked: number; expired: number;
  monthlyTrends: { month: string; issuances: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
}
class CertificateService {
  async getAllCertificates(): Promise<Certificate[]> {
    const data = await api<{ certificates: Certificate[] }>('/certificates?limit=100');
    return data.certificates;
  }
  async getCertificateById(id: string): Promise<Certificate | null> {
    try { return (await api<{ certificate: Certificate }>(`/certificates/${encodeURIComponent(id)}`)).certificate; }
    catch (e) { if (e instanceof Error && /not found/i.test(e.message)) return null; throw e; }
  }
  async getCertificatesByHolderEmail(email: string): Promise<Certificate[]> {
    const { certificates } = await api<{ certificates: Certificate[] }>('/holder/certificates');
    return certificates.filter(c => c.holderEmail.toLowerCase() === email.toLowerCase());
  }
  async issueCertificate(input: CertificateIssueInput): Promise<Certificate> {
    return (await api<{ certificate: Certificate }>('/certificates', { method: 'POST', body: JSON.stringify(input) })).certificate;
  }
  async revokeCertificate(id: string, reason: string): Promise<Certificate> {
    return (await api<{ certificate: Certificate }>(`/certificates/${encodeURIComponent(id)}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) })).certificate;
  }
  async getDashboardStats(): Promise<DashboardStats> { return api<DashboardStats>('/dashboard/stats'); }
}
export const certificateService = new CertificateService();
