import axios from 'axios';

export const mainAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    token: '0cb2144dab7c7858cc17',
  },
});
