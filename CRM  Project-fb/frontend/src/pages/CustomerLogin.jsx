import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
// آیکون‌ها
import { Smartphone, ArrowRight, User } from 'lucide-react';

export default function CustomerLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // اعتبارسنجی ساده شماره
    if (!phone || phone.length < 10) {
        toast.error("لطفا شماره موبایل صحیح وارد کنید");
        return;
    }

    setLoading(true);
    try {
      // ارسال درخواست به بکند
      // نکته: برای مشتری پسورد مهم نیست، فقط شماره موبایل چک می‌شود
      const response = await api.post('/auth/login', { 
        username: phone, 
        password: "customer_dummy_password" 
      });
      
      const { access_token, role, name } = response.data;
      
      // چک کردن اینکه آیا واقعا مشتری است؟
      if (role !== 'customer') {
        toast.error("شما ادمین هستید، لطفا از صفحه ورود همکاران استفاده کنید.");
        return;
      }

      // ذخیره توکن و ورود
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);

      toast.success(`خوش آمدید ${name}`);
      navigate('/portal');

    } catch (err) {
      console.error(err);
      toast.error('شماره شما در سیستم یافت نشد. لطفا با پشتیبانی تماس بگیرید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-blue-100">
        
        {/* هدر */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
             <Smartphone size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ورود مشتریان</h1>
          <p className="text-gray-500 mt-2 text-sm">شماره موبایل خود را وارد کنید تا وضعیت سرویس‌ها را ببینید.</p>
        </div>

        {/* فرم ورود */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل:</label>
            <div className="relative">
                <input 
                  type="tel" 
                  className="w-full pl-4 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:bg-white bg-gray-50 outline-none transition text-center text-xl font-bold tracking-widest text-gray-700 placeholder-gray-300"
                  placeholder="0912xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
                <User className="absolute top-4 right-4 text-gray-400" size={24}/>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200 disabled:opacity-50 text-lg flex justify-center items-center gap-2"
          >
            {loading ? 'در حال بررسی...' : <>ورود به پورتال <ArrowRight size={20}/></>}
          </button>
        </form>

        {/* لینک بازگشت */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
                بازگشت به صفحه اصلی
            </Link>
        </div>
      </div>
    </div>
  );
}