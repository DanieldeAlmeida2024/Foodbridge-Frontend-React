import axios from "axios";
import { clearSession, readSession } from "../auth/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const { user } = readSession(localStorage);
  if (!user && (localStorage.getItem("token") || localStorage.getItem("tempToken"))) {
    clearSession(localStorage);
    window.dispatchEvent(new Event("foodbridge:session-expired"));
  }
  const token = user?.accessToken || user?.tempToken;
  if (!config.headers.Authorization && token) config.headers.Authorization = `Bearer ${token}`;
  if (config.headers.Authorization === "Bearer null" || config.headers.Authorization === "Bearer undefined") {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    clearSession(localStorage);
    window.dispatchEvent(new Event("foodbridge:session-expired"));
  }
  return Promise.reject(error);
});

export default api;
