import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  isAuth: boolean | null;
  setIsAuth: (authState: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const res = await AuthService.isAuthenticated();
      setIsAuth(res);
    };
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
