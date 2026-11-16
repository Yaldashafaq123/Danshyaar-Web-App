// lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

// ============================================
// API URL Configuration
// ============================================
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL must be configured.');
}

let parsedApiUrl: URL;
try {
  parsedApiUrl = new URL(configuredApiUrl);
} catch {
  throw new Error('NEXT_PUBLIC_API_URL must be a valid absolute URL.');
}

function assertSecureApiTransport(): void {
  const isHttpAllowed =
    parsedApiUrl.protocol === 'http:' &&
    process.env.NODE_ENV !== 'production';

  if (parsedApiUrl.protocol !== 'https:' && !isHttpAllowed) {
    throw new Error(
      'NEXT_PUBLIC_API_URL must use HTTPS in production; HTTP is only allowed outside production.'
    );
  }
}

export const API_URL = parsedApiUrl.toString().replace(/\/$/, '');

// ============================================
// Axios Instance
// ============================================
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// ============================================
// Request Interceptor — Add token
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    assertSecureApiTransport();

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor — Handle errors
// ============================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized — auto logout
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;