// src/types/api.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag pour éviter les événements multiples en cas de 401/403 simultanés
let isHandlingAuthError = false;

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    // Une requête réussie réarme la gestion des erreurs d'auth (évite que le flag
    // ne reste bloqué à true pour toute la session).
    isHandlingAuthError = false;
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Considérer 401 (Unauthorized) et 403 (Forbidden) comme des erreurs d'authentification
    if ((status === 401 || status === 403) && !isHandlingAuthError) {
      isHandlingAuthError = true;

      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Déclencher un événement personnalisé pour React (ex: déconnexion)
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return Promise.reject(error);
  }
);

export default api;