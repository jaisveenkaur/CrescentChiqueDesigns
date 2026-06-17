import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for request diagnostics
api.interceptors.request.use(
  (config) => {
    console.log(`[SESSION CHECK] Initiating request to URL: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiry and common HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401 Unauthorized indicates credentials missing or expired
      if (status === 401) {
        console.warn(`[SESSION FAILED] Request rejected with 401 Unauthorized for URL: ${error.config?.url}`);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('is_logged_in');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_id');
          // Redirect if not currently on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
