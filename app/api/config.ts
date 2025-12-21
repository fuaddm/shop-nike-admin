import axios from 'axios';

export const mainAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    key: import.meta.env.VITE_PLATFORM_KEY,
  },
});
