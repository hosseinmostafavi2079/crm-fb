import axios from 'axios';
import { toast } from 'react-toastify';

// اتصال به پورت استاندارد جنگو
const baseURL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// تزریق توکن به هدر تمام درخواست‌ها
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// مدیریت هوشمند خطاها
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // اگر توکن منقضی شده یا نامعتبر است
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    
    // نمایش خطای عمومی اگر ارور خاصی هندل نشده بود
    const message = error.response?.data?.detail || "خطایی در ارتباط با سرور رخ داد";
    if (error.response?.status !== 401 && error.response?.status !== 404) {
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;