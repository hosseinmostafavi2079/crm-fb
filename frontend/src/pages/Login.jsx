import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // درخواست به API جدید جنگو
      const res = await api.post('/api/auth/login/', { 
        username: username, 
        password: password 
      });

      // ذخیره توکن‌ها
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('name', username);

      toast.success("ورود موفقیت‌آمیز");

      // انتقال به داشبورد
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("نام کاربری یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-blue-700 p-6 text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
             <ShieldCheck size={32}/>
          </div>
          <h1 className="text-xl font-bold">CRM مستک</h1>
          <p className="text-blue-200 text-sm mt-1">ورود مدیریت</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-2">نام کاربری</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-left dir-ltr"
                  placeholder="admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
                <User className="absolute top-3.5 right-3 text-gray-400" size={20}/>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-bold mb-2">رمز عبور</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-left dir-ltr"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock className="absolute top-3.5 right-3 text-gray-400" size={20}/>
              </div>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50 mt-4">
              {loading ? 'در حال ورود...' : 'ورود به سیستم'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}