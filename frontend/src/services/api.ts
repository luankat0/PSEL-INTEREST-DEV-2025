import axios from 'axios';

export const api = axios.create({
  // Garante que esta URL corresponde à porta onde o teu Backend FastAPI está a rodar
  baseURL: 'http://localhost:8000', 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);