import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  loginAsDemoRole: (role: UserRole) => Promise<User>;
  switchDemoUser: (user: User) => Promise<User>;
  logout: () => Promise<void>;
  demoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read persisted demo session on mount
    const current = authService.getCurrentUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password = ''): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.loginWithCredentials(email, password);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoRole = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.loginWithDemoRole(role);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (targetUser: User): Promise<User> => {
    setIsLoading(true);
    try {
      const updated = await authService.loginWithUser(targetUser);
      setUser(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const role: UserRole = user ? user.role : 'PUBLIC_VERIFIER';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemoRole,
        switchDemoUser,
        logout,
        demoUsers: authService.getDemoUsers(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
