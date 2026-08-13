import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const be = error.response.data;
      return Promise.reject({
        status: error.response.status,
        code: be?.error?.code || 'UNKNOWN_ERROR',
        message: be?.error?.message || 'An unexpected error occurred',
        details: be?.error?.details || null,
      });
    }
    if (error.request) {
      return Promise.reject({
        status: 0, code: 'NETWORK_ERROR',
        message: 'Unable to reach the server.', details: null,
      });
    }
    return Promise.reject({
      status: 0, code: 'REQUEST_ERROR',
      message: error.message || 'Failed to send request.', details: null,
    });
  }
);

/** POST /api/participants — create or retrieve participant */
export const createParticipant = (data) => api.post('/participants', data);

/** GET /api/participants/:publicId */
export const getParticipant = (publicId) => api.get(`/participants/${publicId}`);

/** GET /api/profiles/:publicId — public QR verification */
export const getPublicProfile = (publicId) => api.get(`/profiles/${publicId}`);

/** POST /api/builder-class/preview */
export const previewBuilderClass = (stack) => api.post('/builder-class/preview', { stack });

/** GET /api/health */
export const healthCheck = () => api.get('/health');

export default api;
