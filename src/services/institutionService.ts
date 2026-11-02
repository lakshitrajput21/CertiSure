import { InstitutionProfile } from '../types/institution';
import { api } from './apiClient';
class InstitutionService {
  async getProfile(): Promise<InstitutionProfile> {
    return (await api<{ profile: InstitutionProfile }>('/institution/profile')).profile;
  }
  async updateProfile(profile: InstitutionProfile): Promise<InstitutionProfile> {
    return (await api<{ profile: InstitutionProfile }>('/institution/profile', { method: 'PUT', body: JSON.stringify(profile) })).profile;
  }
}
export const institutionService = new InstitutionService();
