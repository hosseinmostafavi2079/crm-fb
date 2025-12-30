import axios from 'axios';

const api = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // ارسال دو‌باره توکن برای محکم‌کاری!
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token; // این خط حیاتی است برای IIS
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("401 Error - Token rejected.");
      // اگر در صفحه لاگین نیستیم، ریدارکت کن
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
           localStorage.removeItem('token');
           window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;