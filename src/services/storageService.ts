import { Certificate } from '../types/certificate';
import { VerificationLog } from '../types/verification';
import { InstitutionProfile } from '../types/institution';
import { User } from '../types/user';
import { INITIAL_CERTIFICATES } from '../data/mockCertificates';
import { INITIAL_VERIFICATIONS } from '../data/mockVerifications';
import { INITIAL_INSTITUTION } from '../data/mockInstitution';
import { DEMO_USERS } from '../data/mockUsers';

const KEYS = {
  CERTIFICATES: 'certisure_certificates_v1',
  VERIFICATIONS: 'certisure_verifications_v1',
  INSTITUTION: 'certisure_institution_v1',
  CURRENT_USER: 'certisure_current_user_v1',
};

class StorageService {
  private memoryFallback: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback if localStorage is disabled or throws
    }
    return this.memoryFallback[key] || null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback
    }
    this.memoryFallback[key] = value;
  }

  private removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fallback
    }
    delete this.memoryFallback[key];
  }

  // Certificates
  getCertificates(): Certificate[] {
    const raw = this.getItem(KEYS.CERTIFICATES);
    if (!raw) {
      this.setCertificates(INITIAL_CERTIFICATES);
      return INITIAL_CERTIFICATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CERTIFICATES;
    }
  }

  setCertificates(certs: Certificate[]): void {
    this.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));
  }

  // Verifications
  getVerifications(): VerificationLog[] {
    const raw = this.getItem(KEYS.VERIFICATIONS);
    if (!raw) {
      this.setVerifications(INITIAL_VERIFICATIONS);
      return INITIAL_VERIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VERIFICATIONS;
    }
  }

  setVerifications(logs: VerificationLog[]): void {
    this.setItem(KEYS.VERIFICATIONS, JSON.stringify(logs));
  }

  // Institution
  getInstitution(): InstitutionProfile {
    const raw = this.getItem(KEYS.INSTITUTION);
    if (!raw) {
      this.setInstitution(INITIAL_INSTITUTION);
      return INITIAL_INSTITUTION;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INSTITUTION;
    }
  }

  setInstitution(profile: InstitutionProfile): void {
    this.setItem(KEYS.INSTITUTION, JSON.stringify(profile));
  }

  // Current User (Demo session only, never passwords)
  getCurrentUser(): User | null {
    const raw = this.getItem(KEYS.CURRENT_USER);
    if (!raw) {
      // Default to Institution Admin for easiest demo exploration
      const defaultUser = DEMO_USERS[0];
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_USERS[0];
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      this.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      this.removeItem(KEYS.CURRENT_USER);
    }
  }

  // Reset to initial defaults
  resetAllData(): void {
    this.setCertificates(INITIAL_CERTIFICATES);
    this.setVerifications(INITIAL_VERIFICATIONS);
    this.setInstitution(INITIAL_INSTITUTION);
    this.setCurrentUser(DEMO_USERS[0]);
  }
}

export const storageService = new StorageService();
