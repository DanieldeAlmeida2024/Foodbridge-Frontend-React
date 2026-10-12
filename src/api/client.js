import axios from "axios";

const api = axios.create({
  baseURL: "",
});

function isValidToken(token) {
  return token && token !== "null" && token !== "undefined";
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tempToken = localStorage.getItem("tempToken");

  if (isValidToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isValidToken(tempToken)) {
    config.headers.Authorization = `Bearer ${tempToken}`;
  } else if (
    config.headers?.Authorization === "Bearer null" ||
    config.headers?.Authorization === "Bearer undefined"
  ) {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
