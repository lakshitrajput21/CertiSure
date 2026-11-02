import { User, UserRole } from '../types/user';
import { api, session } from './apiClient';

const USER_KEY = 'certisure_session_user';
interface LoginResponse { user: User; token: string; refreshToken: string; }

class AuthService {
  getDemoUsers(): User[] { return []; }
  getCurrentUser(): User | null {
    if (!session.token()) return null;
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }
  async restoreSession(): Promise<User | null> {
    if (!session.token()) return null;
    try {
      const { user } = await api<{ user: User }>('/auth/me');
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch { this.clearSession(); return null; }
  }
  private store(result: LoginResponse): User {
    session.save(result.token, result.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result.user;
  }
  async loginWithCredentials(email: string, password: string): Promise<User> {
    return this.store(await api<LoginResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }));
  }
  async loginWithDemoRole(role: UserRole): Promise<User> {
    return this.store(await api<LoginResponse>('/auth/demo-login', {
      method: 'POST', body: JSON.stringify({ role }),
    }));
  }
  async loginWithUser(user: User): Promise<User> { return this.loginWithDemoRole(user.role); }
  private clearSession() { session.clear(); sessionStorage.removeItem(USER_KEY); }
  async logout(): Promise<void> {
    try { if (session.token()) await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: session.refresh() }) }); }
    finally { this.clearSession(); }
  }
}
export const authService = new AuthService();
