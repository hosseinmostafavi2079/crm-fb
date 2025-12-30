import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Laptop, Shield, Clock, RefreshCw, Package, AlertCircle } from 'lucide-react';

export default function CustomerPortal() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // اگر نام نبود، پیش‌فرض بگذار
  const userName = localStorage.getItem('name') || 'مشتری عزیز';

  const fetchMyServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-services');
      
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setServices([]); 
    } finally {
      // *** خط حیاتی که جا افتاده بود ***
      // چه موفق شود چه خطا دهد، لودینگ باید خاموش شود
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* اگر لوگو لود نشد، سایت بهم نریزد */}
             {logo && <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />}
             <div>
                <h1 className="text-xl font-bold text-gray-800">پورتال مشتریان</h1>
                <p className="text-xs text-gray-500 mt-1">خوش آمدید، {userName}</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchMyServices} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-200 transition" title="بروزرسانی">
                 <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
            </button>
            <button onClick={logout} className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition">
                <LogOut size={18}/> <span className="hidden md:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 mt-8">
        
        {/* خلاصه وضعیت - فقط وقتی لودینگ تمام شد نشان بده */}
        {!loading && (
            <div className="bg-gradient-to-l from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg mb-8 flex justify-between items-center animate-fade-in-up">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{services.length} سرویس فعال</h2>
                    <p className="text-blue-100 text-sm">شما در حال مشاهده تمام محصولات و خدمات ثبت شده خود هستید.</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <Package size={32} className="text-white"/>
                </div>
            </div>
        )}

        <h3 className="font-bold text-gray-700 mb-4 text-lg border-r-4 border-blue-500 pr-3">لیست محصولات و خدمات شما</h3>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <RefreshCw className="animate-spin mb-2" size={30}/>
               <p>در حال دریافت اطلاعات...</p>
           </div>
        ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                <AlertCircle className="text-gray-300 mb-4" size={48}/>
                <p className="text-gray-500 font-bold">هیچ سرویسی برای شما یافت نشد.</p>
                <p className="text-gray-400 text-sm mt-2">اگر خریدی انجام داده‌اید با پشتیبانی تماس بگیرید.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {services.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 relative overflow-hidden group">
                        
                        {/* نوار رنگی بالای کارت */}
                        <div className={`absolute top-0 right-0 left-0 h-2 ${item.Device !== '-' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>

                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${item.Device !== '-' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {item.Device !== '-' ? <Laptop size={28}/> : <Shield size={28}/>}
                            </div>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                                {item.Device !== '-' ? 'سخت‌افزار' : 'نرم‌افزار'}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                            {item.Device !== '-' ? item.Device : item.Antivirus}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 font-medium">
                            {item.Model !== '-' ? item.Model : 'لایسنس دیجیتال'}
                        </p>
                        
                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            {/* نمایش تاریخ خرید همیشه */}
                            <div className="flex justify-between items-center text-sm group-hover:bg-gray-50 p-2 rounded-lg transition">
                                <span className="text-gray-500 flex items-center gap-2">تاریخ خرید:</span>
                                <span className="font-bold text-gray-700 dir-ltr font-mono">{item.BuyDate || '-'}</span>
                            </div>

                            {item.Device !== '-' && (
                                <div className="flex justify-between items-center text-sm group-hover:bg-gray-50 p-2 rounded-lg transition">
                                    <span className="text-gray-500 flex items-center gap-2"><Clock size={16} className="text-orange-400"/> پایان گارانتی:</span>
                                    <span className="font-bold text-gray-700 dir-ltr font-mono">{item.WarrantyDate}</span>
                                </div>
                            )}
                            
                            {(item.Antivirus !== '-' || item.Device === '-') && (
                                <div className="flex justify-between items-center text-sm group-hover:bg-gray-50 p-2 rounded-lg transition">
                                    <span className="text-gray-500 flex items-center gap-2"><Shield size={16} className="text-green-500"/> پایان آنتی‌ویروس:</span>
                                    <span className="font-bold text-gray-700 dir-ltr font-mono">{item.AntivirusDate}</span>
                                </div>
                            )}

                             {item.Serial !== '-' && (
                                <div className="flex justify-between items-center text-sm group-hover:bg-gray-50 p-2 rounded-lg transition">
                                    <span className="text-gray-500">سریال:</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all">{item.Serial}</span>
                                </div>
                            )}
                        </div>

                        {item.Notes && (
                            <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl border border-yellow-100 leading-relaxed">
                                📝 {item.Notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}