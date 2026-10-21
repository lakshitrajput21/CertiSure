import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Certificate, CertificateIssueInput } from '../types/certificate';
import { InstitutionProfile } from '../types/institution';
import { certificateService, DashboardStats } from '../services/certificateService';
import { institutionService } from '../services/institutionService';
import { storageService } from '../services/storageService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface CertificateContextType {
  certificates: Certificate[];
  stats: DashboardStats | null;
  institution: InstitutionProfile;
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  refreshData: () => Promise<void>;
  issueCertificate: (input: CertificateIssueInput) => Promise<Certificate>;
  revokeCertificate: (id: string, reason: string) => Promise<Certificate>;
  updateInstitution: (profile: InstitutionProfile) => Promise<InstitutionProfile>;
  resetAllDemoData: () => Promise<void>;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [institution, setInstitution] = useState<InstitutionProfile>(storageService.getInstitution());
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  }, [dismissToast]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [certs, newStats, inst] = await Promise.all([
        certificateService.getAllCertificates(),
        certificateService.getDashboardStats(),
        institutionService.getProfile(),
      ]);
      setCertificates(certs);
      setStats(newStats);
      setInstitution(inst);
    } catch (err) {
      console.error('Failed to load certificates data', err);
      showToast('error', 'Sync Error', 'Failed to synchronize institutional records.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const issueCertificate = async (input: CertificateIssueInput): Promise<Certificate> => {
    try {
      const newCert = await certificateService.issueCertificate(input);
      await refreshData();
      showToast(
        'success',
        'Certificate Issued Successfully',
        `Credential ID ${newCert.id} has been registered and is now verifiable.`
      );
      return newCert;
    } catch (err: any) {
      showToast('error', 'Issuance Failed', err.message || 'Could not register credential.');
      throw err;
    }
  };

  const revokeCertificate = async (id: string, reason: string): Promise<Certificate> => {
    try {
      const updated = await certificateService.revokeCertificate(id, reason);
      await refreshData();
      showToast(
        'warning',
        'Certificate Revoked',
        `Credential ${id} has been permanently flagged as REVOKED in the registry.`
      );
      return updated;
    } catch (err: any) {
      showToast('error', 'Revocation Failed', err.message || 'Could not revoke credential.');
      throw err;
    }
  };

  const updateInstitution = async (profile: InstitutionProfile): Promise<InstitutionProfile> => {
    try {
      const updated = await institutionService.updateProfile(profile);
      setInstitution(updated);
      showToast('success', 'Settings Saved', 'Institutional profile and verification credentials updated.');
      return updated;
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not save profile.');
      throw err;
    }
  };

  const resetAllDemoData = async () => {
    storageService.resetAllData();
    await refreshData();
    showToast('info', 'Demo Data Reset', 'All records have been restored to initial sample state.');
  };

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        stats,
        institution,
        isLoading,
        toasts,
        showToast,
        dismissToast,
        refreshData,
        issueCertificate,
        revokeCertificate,
        updateInstitution,
        resetAllDemoData,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificates = (): CertificateContextType => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};
