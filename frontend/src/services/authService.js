/**
 * Auth API service — Google Sign-In (UI-only for now).
 * Currently returns mock data; swap implementations when backend is ready.
 */
import api from './api';
import { MOCK_USER } from '../utils/mockData';

const USE_MOCK = false;

/**
 * Authenticate with a Google credential token.
 * @param {string} credential - Google OAuth ID token
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function googleSignIn(credential) {
  if (USE_MOCK) {
    await delay(800);
    const token = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('auth_token', token);
    return { user: MOCK_USER, token };
  }

  const { data } = await api.post('/api/auth/google', { credential });
  localStorage.setItem('auth_token', data.token);
  return data;
}

/**
 * Sign out the current user.
 */
export function signOut() {
  localStorage.removeItem('auth_token');
}

/**
 * Get the current user profile.
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  if (USE_MOCK) {
    return MOCK_USER;
  }

  try {
    const { data } = await api.get('/api/auth/me');
    return data;
  } catch {
    localStorage.removeItem('auth_token');
    return null;
  }
}

/* ---------- helpers ---------- */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
