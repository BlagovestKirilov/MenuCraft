import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
});

// Track whether a token refresh is in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Request interceptor: attach JWT token ──
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: refresh token on 401 ──
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, if we haven't already retried, and not on auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedRefreshToken) {
        // No refresh token available — force logout
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Save new tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (data.role) {
          localStorage.setItem('role', data.role);
        }

        // Update default header and retry original request
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);

        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Only redirect to login on 401 for non-auth endpoints (token truly expired)
    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/')) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // For all other errors (400, 403, 404, 409, 500, etc.), just reject
    // so the calling component can display the error message on screen
    return Promise.reject(error);
  }
);

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  if (!window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth/login';
  }
}

export default client;
