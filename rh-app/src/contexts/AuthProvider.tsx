// src/contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/auth.service';

import { AxiosError } from 'axios';
import { isTokenExpired } from '../utils/token';
import type { AuthUser } from '../types/auth';

// Lit la session depuis le stockage local de façon synchrone (évite un flash de chargement
// et tout besoin d'actualiser après connexion).
const readStoredUser = (): AuthUser | null => {
  try {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    if (storedUser && token && !isTokenExpired(token)) {
      return storedUser;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Erreur de chargement de la session', error);
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleSessionExpired);
    return () => window.removeEventListener('auth:logout', handleSessionExpired);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      const userData: AuthUser = {
        username: data.username,
        roles: data.roles,
        droits: data.droits || [],
        userId: data.userId,
        agentId: data.agentId,
      };
      // On écrit la session PUIS on met à jour l'état (l'ordre garantit que le token
      // est déjà disponible pour les requêtes émises juste après la navigation).
      authService.setSession(data.token, userData);
      setUser(userData);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const error = err as AxiosError;
      console.error('Erreur de connexion:', error);
      let errorMessage = 'Email ou mot de passe incorrect';

      if (error.response?.data && typeof error.response.data === 'object') {
        const data = error.response.data as { message?: string };
        if (data.message) errorMessage = data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, signIn, signOut }), [user, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
