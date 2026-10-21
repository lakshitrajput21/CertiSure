export interface InstitutionProfile {
  id: string;
  name: string;
  code: string;
  accreditationId: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  defaultSignatoryName: string;
  defaultSignatoryTitle: string;
  establishedYear: number;
  logoUrl?: string;
  verificationBadgeText: string;
}
