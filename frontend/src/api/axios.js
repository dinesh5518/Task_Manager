import axios from 'axios';

const defaultBaseURL = import.meta.env.DEV
  ? 'https://task-manager-vgid.onrender.com'
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

const API_URL = import.meta.env.VITE_API_URL || defaultBaseURL;

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
