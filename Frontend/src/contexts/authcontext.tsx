import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  profilePhoto?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook untuk menggunakan Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (dari localStorage, sessionStorage, atau API)
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: User, token: string) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
