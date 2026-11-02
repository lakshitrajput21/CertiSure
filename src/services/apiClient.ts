const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const TOKEN_KEY = 'certisure_access_token';
const REFRESH_KEY = 'certisure_refresh_token';

export const session = {
  token: () => sessionStorage.getItem(TOKEN_KEY),
  save: (access: string, refresh?: string) => {
    sessionStorage.setItem(TOKEN_KEY, access);
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
  },
  refresh: () => sessionStorage.getItem(REFRESH_KEY),
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(REFRESH_KEY); },
};

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = session.token();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const message = payload.error?.message || payload.message || `Request failed (${response.status})`;
    if (response.status === 401 && path !== '/auth/login') session.clear();
    throw new Error(message);
  }
  return payload.data as T;
}

export function apiUrl(path: string): string { return `${API_BASE}${path}`; }
