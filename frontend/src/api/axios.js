import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api`
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Network error: unable to reach the API server';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
