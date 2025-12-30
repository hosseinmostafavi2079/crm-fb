import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
// *** تغییر مهم: ShieldLock را به ShieldCheck تغییر دادیم ***
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, role, name } = response.data;
      
      if (role !== 'admin') {
        toast.error("دسترسی غیرمجاز");
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);

      toast.success(`خوش آمدید مدیر گرامی`);
      navigate('/admin');

    } catch (err) {
      toast.error('نام کاربری یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-800">
             {/* *** تغییر مهم: اینجا هم اسم آیکون عوض شد *** */}
             <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">پنل مدیریت CRM</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">نام کاربری:</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-black outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">رمز عبور:</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-black outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? '...' : 'ورود امن'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition">
                بازگشت به ورود مشتریان <ArrowRight size={12}/>
            </Link>
        </div>
      </div>
    </div>
  );
}