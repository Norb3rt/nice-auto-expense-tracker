import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';
import { authService, AuthResult } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      
      if (user && user.email) {
        // Validate that the user is still authorized
        const isAuthorized = await authService.isAuthorizedUser(user.email);
        
        if (isAuthorized) {
          const userData: User = {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0]
          };
          setCurrentUser(userData);
        } else {
          // User is no longer authorized, sign them out
          await authService.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(null);
      setFirebaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
