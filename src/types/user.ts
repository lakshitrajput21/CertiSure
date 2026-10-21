export type UserRole = 'INSTITUTION_ADMIN' | 'CERTIFICATE_HOLDER' | 'PUBLIC_VERIFIER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  institutionId?: string;
  institutionName?: string;
  holderEmail?: string; // used to link to certificates for holder role
  designation?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
