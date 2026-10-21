import { User, UserRole } from '../types/user';
import { DEMO_USERS } from '../data/mockUsers';
import { storageService } from './storageService';

export class AuthService {
  getDemoUsers(): User[] {
    return DEMO_USERS;
  }

  getCurrentUser(): User | null {
    return storageService.getCurrentUser();
  }

  async loginWithDemoRole(role: UserRole): Promise<User> {
    const user = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    storageService.setCurrentUser(user);
    return user;
  }

  async loginWithUser(user: User): Promise<User> {
    storageService.setCurrentUser(user);
    return user;
  }

  async loginWithCredentials(
    email: string,
    _password: string, // Intentionally ignored in frontend-only mock; never stored
    _role?: UserRole
  ): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      storageService.setCurrentUser(existing);
      return existing;
    }

    // Dynamic mock user creation based on email domain
    let detectedRole: UserRole = 'PUBLIC_VERIFIER';
    if (cleanEmail.includes('admin') || cleanEmail.includes('pec.edu.in')) {
      detectedRole = 'INSTITUTION_ADMIN';
    } else if (cleanEmail.includes('student') || cleanEmail.includes('holder')) {
      detectedRole = 'CERTIFICATE_HOLDER';
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      role: detectedRole,
      holderEmail: cleanEmail,
      institutionName: detectedRole === 'INSTITUTION_ADMIN' ? 'Punjab Engineering College' : undefined,
      designation: detectedRole === 'INSTITUTION_ADMIN' ? 'Institutional Administrator' : 'Credential Holder',
    };

    storageService.setCurrentUser(newUser);
    return newUser;
  }

  async logout(): Promise<void> {
    storageService.setCurrentUser(null);
  }
}

export const authService = new AuthService();
