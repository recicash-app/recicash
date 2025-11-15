import axios from "axios";

const api = axios.create({
  baseURL: 'http://api.docker.localhost/api/v1', // Ex: http://localhost:8000/api
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;
