import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true, // Required for X OAuth session cookies
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

// ─── Participant Endpoints ───────────────────────────────────────

/** POST /api/participants — create participant with photo file via multipart/form-data */
export const createParticipantWithPhoto = (formData) =>
  api.post('/participants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // Photo upload may take longer
  });

/** POST /api/participants — create or retrieve participant (JSON, no photo file) */
export const createParticipant = (data) => api.post('/participants', data);

/** GET /api/participants/:publicId */
export const getParticipant = (publicId) => api.get(`/participants/${publicId}`);

// ─── Profile Endpoints ───────────────────────────────────────────

/** GET /api/profiles/:publicId — public QR verification */
export const getPublicProfile = (publicId) => api.get(`/profiles/${publicId}`);

// ─── Builder Class Endpoints ─────────────────────────────────────

/** POST /api/builder-class/preview — preview builder class from stack */
export const previewBuilderClass = (stack) => api.post('/builder-class/preview', { stack });

// ─── X (Twitter) Share Endpoints ─────────────────────────────────

/** GET /api/x/auth — get X OAuth 2.0 authorization URL */
export const getXAuthUrl = () => api.get('/x/auth');

/** POST /api/x/share — upload card PNG and publish to X */
export const shareCardToX = (cardBlob) => {
  const formData = new FormData();
  formData.append('card', cardBlob, 'hhgoa-card.png');
  return api.post('/x/share', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
};

// ─── Health ──────────────────────────────────────────────────────

/** GET /api/health */
export const healthCheck = () => api.get('/health');

export default api;
