import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Lock, User, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login/', formData);
      
      // --- ذخیره‌سازی دقیق برای جلوگیری از خروج ناخواسته ---
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('role', 'admin'); 
      localStorage.setItem('user_name', formData.username);

      toast.success("ورود موفقیت‌آمیز!");
      setTimeout(() => window.location.href = '/admin', 800);

    } catch (err) {
      toast.error("نام کاربری یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-white" dir="rtl">
      {/* بخش راست: فرم */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-16 lg:p-24 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="text-right space-y-2">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200"><LayoutDashboard size={28}/></div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ورود به پنل</h1>
            <p className="text-gray-500 text-lg">به CRM مستک خوش آمدید.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">نام کاربری</label>
              <div className="relative group">
                <input required className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 transition-all outline-none dir-ltr text-left"
                  placeholder="admin" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/>
                <User className="absolute top-4 right-4 text-gray-400" size={20}/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">رمز عبور</label>
              <div className="relative group">
                <input type="password" required className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 transition-all outline-none dir-ltr text-left"
                  placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
                <Lock className="absolute top-4 right-4 text-gray-400" size={20}/>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-lg">
              {loading ? '...' : <>ورود به سیستم <ArrowRight size={20}/></>}
            </button>
          </form>
        </div>
      </div>
      
      {/* بخش چپ: گرافیک */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
        <div className="relative z-10 text-center p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-4">مدیریت هوشمند کسب‌وکار</h2>
          <p className="text-indigo-200 leading-relaxed">ثبت پذیرش سریع، مدیریت گارانتی آنتی‌ویروس و گزارش‌گیری دقیق.</p>
        </div>
      </div>
    </div>
  );
}