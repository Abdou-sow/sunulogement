import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getImageUrl = (url) =>
  !url ? "" : url.startsWith("http") ? url : `${API_URL}${url}`;

const api = axios.create({
  baseURL: `${API_URL}/`,
});

// Ajouter automatiquement le token si l’utilisateur est connecté
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
