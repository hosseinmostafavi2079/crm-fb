import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Search, Trash2, FileUp, Database, AlertOctagon, RefreshCw, Smartphone, Laptop, User } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  // دریافت لیست مشتریان از API جدید
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // آدرس جدید API
      const res = await api.get('/api/customers/');
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت لیست مشتریان");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // هندل کردن جستجو
  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.includes(search)) || 
    (c.phone && c.phone.includes(search)) ||
    (c.serial && c.serial.includes(search))
  );

  // حذف مشتری
  const handleDelete = async (id) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        await api.delete(`/api/customers/${id}/`);
        toast.success("حذف شد");
        fetchCustomers();
      } catch (err) {
        toast.error("خطا در حذف");
      }
    }
  };

  // آپلود اکسل
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    const loadingToast = toast.loading("در حال پردازش فایل...");
    try {
      // متد اختصاصی که در views.py نوشتیم
      const res = await api.post('/api/customers/import_excel/', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      toast.update(loadingToast, { render: `تعداد ${res.data.imported} مشتری وارد شد`, type: "success", isLoading: false, autoClose: 3000 });
      fetchCustomers();
    } catch (err) {
      toast.update(loadingToast, { render: "خطا در آپلود فایل", type: "error", isLoading: false, autoClose: 3000 });
    }
    e.target.value = null; // ریست کردن اینپوت
  };

  return (
    <div className="animate-fade-in-up pb-20">
      
      {/* هدر */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            مشتریان <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{customers.length}</span>
        </h1>
        
        <div className="flex gap-2">
            <button onClick={fetchCustomers} className="bg-white border p-2 rounded-xl hover:bg-gray-50">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
            </button>
            <button onClick={() => fileInputRef.current.click()} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-green-700 transition">
                <FileUp size={18}/> ایمپورت اکسل
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept=".xlsx" />
        </div>
      </div>

      {/* جستجو */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="جستجو نام، شماره یا سریال..." 
          className="w-full p-4 pr-12 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition" 
          value={search} 
          onChange={e => setSearch(e.target.value)}
        />
        <Search className="absolute top-4 right-4 text-gray-400" size={22} />
      </div>

      {/* جدول */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">مشتری</th>
                <th className="p-4">دستگاه</th>
                <th className="p-4">آخرین خرید</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">در حال دریافت اطلاعات...</td></tr>
              ) : filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50 transition">
                    <td className="p-4">
                        <div className="font-bold text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                           <Smartphone size={12}/> {c.phone}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="text-sm text-gray-700 flex items-center gap-2">
                          <Laptop size={14} className="text-gray-400"/> {c.device}
                        </div>
                        <div className="text-[10px] bg-gray-100 inline-block px-1.5 rounded mt-1 text-gray-500 font-mono">
                          {c.serial}
                        </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                        {/* فیلد jalali_buy_date را در سریالایزر اضافه کرده بودیم */}
                        {c.jalali_buy_date || c.buy_date}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition">
                          <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}