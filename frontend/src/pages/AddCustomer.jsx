import { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Save, Laptop, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    Name: '', Phone: '',
    Device: '', Model: '', Serial: '', WarrantyDate: '',
    Antivirus: '-', AntivirusDate: ''
  });

  useEffect(() => {
    // دریافت لیست محصولات برای پر کردن لیست کشویی آنتی‌ویروس
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.Phone) return toast.error("نام و شماره تماس الزامی است");
    
    try {
      await api.post('/customers', formData);
      toast.success("مشتری با موفقیت ثبت شد");
      navigate('/admin/customers');
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <UserPlus className="text-gray-700" size={28}/>
        <h1 className="text-2xl font-bold text-gray-800">ثبت مشتری جدید</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        
        {/* بخش ۱: اطلاعات فردی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">نام و نام خانوادگی:</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 outline-none transition"
              value={formData.Name}
              onChange={e => setFormData({...formData, Name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">شماره تماس:</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 outline-none transition"
              value={formData.Phone}
              onChange={e => setFormData({...formData, Phone: e.target.value})}
            />
          </div>
        </div>

        <hr className="border-gray-100"/>

        {/* بخش ۲: اطلاعات دستگاه */}
        <div>
          <h3 className="text-md font-bold text-gray-700 flex items-center gap-2 mb-4">
            <Laptop size={18}/> اطلاعات دستگاه
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 mb-1">نام دستگاه (مثلاً لپ‌تاپ ایسوس):</label>
               <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                 value={formData.Device} onChange={e => setFormData({...formData, Device: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">مدل:</label>
               <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                 value={formData.Model} onChange={e => setFormData({...formData, Model: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">شماره سریال:</label>
               <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3"
                 value={formData.Serial} onChange={e => setFormData({...formData, Serial: e.target.value})} />
            </div>
            <div className="col-span-full md:col-span-1 md:col-start-3">
               <label className="block text-xs font-bold text-gray-500 mb-1">تاریخ پایان گارانتی (مثلاً 1404/01/01):</label>
               <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left" dir="ltr"
                 placeholder="1404/xx/xx"
                 value={formData.WarrantyDate} onChange={e => setFormData({...formData, WarrantyDate: e.target.value})} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100"/>

        {/* بخش ۳: اطلاعات آنتی‌ویروس */}
        <div>
          <h3 className="text-md font-bold text-gray-700 flex items-center gap-2 mb-4">
            <Shield size={18}/> اطلاعات آنتی‌ویروس
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام آنتی‌ویروس:</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none"
                value={formData.Antivirus}
                onChange={e => setFormData({...formData, Antivirus: e.target.value})}
              >
                <option value="-">-</option>
                {products.map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">تاریخ انقضای آنتی‌ویروس:</label>
               <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left" dir="ltr"
                 placeholder="1404/xx/xx"
                 value={formData.AntivirusDate} onChange={e => setFormData({...formData, AntivirusDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* دکمه ثبت */}
        <div className="flex justify-end pt-4">
            <button className="bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-sm">
                <Save size={20}/> ثبت اطلاعات
            </button>
        </div>

      </form>
    </div>
  );
}