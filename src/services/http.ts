// services/http.ts (ou onde você cria o axios instance `api`)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://api-teste-vibbra.agenciatecnet.com.br/public',
  timeout: 10000,
});


// Injeta o Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata 401 com cuidado
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');
    const token = localStorage.getItem('token');

    // Se for erro de auth nas rotas de login/SSO, NÃO redireciona!
    const isAuthRoute = url.includes('/authenticate') || url.includes('/authenticate/sso');

    if (status === 401 && !isAuthRoute) {
      // Só faz logout/redireciona se o usuário estava logado
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      // Use SPA navigation se puder; como fallback:
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
