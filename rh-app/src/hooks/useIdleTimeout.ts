// src/hooks/useIdleTimeout.ts
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export const useIdleTimeout = (timeoutMinutes: number = 10) => {
  const { signOut } = useAuth();
  const timerRef = useRef<number | null>(null);   // ← changer le type

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      signOut(); // Déconnexion après inactivité
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [signOut, timeoutMinutes]);
};