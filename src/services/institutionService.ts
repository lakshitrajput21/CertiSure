import { InstitutionProfile } from '../types/institution';
import { storageService } from './storageService';

export class InstitutionService {
  async getProfile(): Promise<InstitutionProfile> {
    return storageService.getInstitution();
  }

  async updateProfile(profile: InstitutionProfile): Promise<InstitutionProfile> {
    storageService.setInstitution(profile);
    return profile;
  }
}

export const institutionService = new InstitutionService();
