import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // این خط را حذف یا کامنت کردیم چون دیگر لازم نیست
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Lock, Smartphone, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1); // 1: Phone, 2: Password/OTP
  const [role, setRole] = useState(null); // 'admin' or 'customer'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // For Admin
  const [otp, setOtp] = useState(''); // For Customer or Admin OTP
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp' for admin
  const [loading, setLoading] = useState(false);

  // مرحله ۱: بررسی شماره تماس
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return toast.error("شماره تماس معتبر نیست");
    
    setLoading(true);
    try {
      const res = await api.post('/api/auth/check-user', { phone }); 
      
      const userRole = res.data.role; // 'admin' یا 'customer'
      setRole(userRole);

      if (userRole === 'admin') {
        setLoginMethod('password');
        setStep(2);
      } else {
        await api.post('/api/auth/send-otp', { phone });
        setLoginMethod('otp');
        setStep(2);
        toast.info("کد تایید پیامک شد");
      }
    } catch (err) {
      if(err.response && err.response.status === 404) {
        toast.error("کاربری با این شماره یافت نشد");
      } else {
        toast.error("خطا در برقراری ارتباط با سرور");
      }
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲: انجام لاگین نهایی
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (role === 'admin' && loginMethod === 'password') {
         res = await api.post('/api/auth/login-pass', { phone, password });
      } 
      else {
         res = await api.post('/api/auth/verify-otp', { phone, code: otp });
      }

      // 1. ذخیره توکن در حافظه مرورگر
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      toast.success(`خوش آمدید ${res.data.name}`);
      
      // 2. هدایت اجباری (Hard Refresh)
      // این کار باعث می‌شود کل برنامه دوباره لود شود و توکن جدید را ببیند
      setTimeout(() => {
          if (res.data.role === 'admin') {
              window.location.href = '/dashboard';
          } else {
              window.location.href = '/portal';
          }
      }, 500);

    } catch (err) {
      toast.error(err.response?.data?.detail || "اطلاعات وارد شده صحیح نیست");
    } finally {
      setLoading(false);
    }
  };

  const requestAdminOtp = async () => {
      setLoading(true);
      try {
          await api.post('/api/auth/send-otp', { phone });
          setLoginMethod('otp');
          toast.info("کد ورود اضطراری ارسال شد");
      } catch (err) {
          toast.error("خطا در ارسال پیامک");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/50 backdrop-blur-xl">
        
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
             {role === 'admin' ? <ShieldCheck size={32}/> : <UserCheck size={32}/>}
          </div>
          <h1 className="text-2xl font-bold mb-1">سیستم مدیریت یکپارچه</h1>
          <p className="text-blue-200 text-sm">ورود امن به حساب کاربری</p>
        </div>

        <div className="p-8">
          
          {step === 1 && (
            <form onSubmit={handleCheckPhone} className="animate-fade-in-up">
              <div className="mb-6">
                <label className="block text-gray-600 text-sm font-bold mb-2 mr-1">شماره تماس</label>
                <div className="relative">
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition outline-none text-left dir-ltr font-mono text-lg tracking-wider"
                      placeholder="0912..."
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      autoFocus
                    />
                    <Smartphone className="absolute top-3.5 right-3 text-gray-400" size={20}/>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'در حال بررسی...' : 'بررسی شماره و ادامه'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleLogin} className="animate-fade-in-up">
              
              <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{phone}</span>
                  <button type="button" onClick={() => { setStep(1); setRole(null); setPassword(''); setOtp(''); }} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                      تغییر شماره <ArrowLeft size={12}/>
                  </button>
              </div>

              {role === 'admin' ? (
                  <>
                    {loginMethod === 'password' ? (
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-bold mb-2">رمز عبور مدیریت</label>
                            <div className="relative">
                                <input 
                                type="password" 
                                className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none transition"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                                />
                                <Lock className="absolute top-3.5 right-3 text-gray-400" size={20}/>
                            </div>
                            <div className="mt-2 text-left">
                                <button type="button" onClick={requestAdminOtp} className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer">
                                    فراموشی رمز؟ ورود با کد پیامک
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 animate-fade-in">
                            <label className="block text-gray-600 text-sm font-bold mb-2">کد ارسالی به مدیر</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-center font-mono text-xl tracking-[0.5em]"
                              value={otp}
                              onChange={e => setOtp(e.target.value)}
                              placeholder="— — — —"
                              maxLength={5}
                              autoFocus
                            />
                            <div className="mt-2 text-left">
                                <button type="button" onClick={() => setLoginMethod('password')} className="text-xs text-gray-500 hover:text-gray-700">
                                    بازگشت به ورود با رمز عبور
                                </button>
                            </div>
                        </div>
                    )}
                  </>
              ) : (
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm font-bold mb-2">کد تایید پیامک شده</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-center font-mono text-xl tracking-[0.5em]"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="— — — —"
                      maxLength={5}
                      autoFocus
                    />
                  </div>
              )}

              <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 disabled:opacity-50">
                {loading ? 'در حال ورود...' : 'ورود به سامانه'}
              </button>
            </form>
          )}

        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">طراحی و توسعه توسط Mostech CRM</p>
        </div>
      </div>
    </div>
  );
}