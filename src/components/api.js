import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        window.location.href = '/login';
      } catch (refreshError) {
        console.log('Authentication failed');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;