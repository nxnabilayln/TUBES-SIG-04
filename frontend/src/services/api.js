// =============================================================================
// services/api.js — Semua panggilan ke backend FastAPI
// =============================================================================
import axios from "axios";

// Kosongkan BASE_URL agar request lewat Vite proxy (/api → http://localhost:8000)
// Jangan pakai http://localhost:8000 langsung karena menyebabkan CORS error
const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Sisipkan JWT token ke setiap request kalau ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tangkap error 401 → paksa logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_info");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── PARKIR ────────────────────────────────────────────────────────────────────
export const parkirAPI = {
  getAll: () => api.get("/api/parkir"),
  getById: (id) => api.get(`/api/parkir/${id}`),
  create: (data) => api.post("/api/parkir", data),
  update: (id, data) => api.put(`/api/parkir/${id}`, data),
  delete: (id) => api.delete(`/api/parkir/${id}`),

  // Spatial queries
  terdekat: (lat, lng, limit = 5, jenis = null) =>
    api.get("/api/parkir/terdekat", {
      params: { lat, lng, limit, ...(jenis && { jenis }) },
    }),
  dalamRadius: (lat, lng, radius = 500, jenis = null) =>
    api.get("/api/parkir/dalam-radius", {
      params: { lat, lng, radius, ...(jenis && { jenis }) },
    }),
  filter: (params) => api.get("/api/parkir/filter", { params }),
};

// ── WILAYAH ───────────────────────────────────────────────────────────────────
export const wilayahAPI = {
  getAll: () => api.get("/api/wilayah"),
  getById: (id) => api.get(`/api/wilayah/${id}`),
  parkirDalam: (id) => api.get(`/api/wilayah/${id}/parkir`),
  statistik: () => api.get("/api/wilayah/statistik/ringkasan"),
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }),
  me: () => api.get("/api/auth/me"),
  changePassword: (data) => api.post("/api/auth/change-password", data),
};

export default api;
