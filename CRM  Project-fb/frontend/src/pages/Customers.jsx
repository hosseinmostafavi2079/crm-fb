import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Search, Trash2, FileUp, Database, AlertOctagon, RefreshCw, X, User, History, ShieldCheck, Calendar, ShieldAlert, Smartphone, Laptop, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const fileInputRef = useRef(null);
  
  // پروفایل
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- 1. تابع گروه‌بندی مشتریان بر اساس شماره ---
  const groupCustomersByPhone = (data) => {
      const groups = {};
      
      data.forEach(item => {
          // اگر شماره ندارد یا نامعتبر است، با ID یکتا گروه بندی کن که حذف نشود
          const key = (item.Phone && item.Phone.length > 5) ? item.Phone : `NO_PHONE_${item.CustomerID}`;
          
          if (!groups[key]) {
              // ساخت سرگروه
              groups[key] = {
                  ...item, // اطلاعات پایه (نام و...)
                  devicesList: [item] // لیست تمام دستگاه‌ها
              };
          } else {
              // اضافه کردن دستگاه جدید به لیست این آدم
              groups[key].devicesList.push(item);
              
              // اگر در رکورد جدید نام کامل‌تری هست، آپدیت کن
              if (item.Name && item.Name.length > groups[key].Name.length) {
                  groups[key].Name = item.Name;
              }
              // آپدیت تاریخ آخرین خرید (ماکسیمم تاریخ)
              if (item.BuyDate > groups[key].BuyDate) {
                  groups[key].BuyDate = item.BuyDate;
              }
          }
      });
      return Object.values(groups);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      if (Array.isArray(res.data)) {
          const grouped = groupCustomersByPhone(res.data);
          setCustomers(grouped);
      }
      else setCustomers([]);
    } catch (error) {
      console.error(error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // --- سورت و فیلتر ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getProcessedData = () => {
      const safeSearch = (str) => String(str || '').toLowerCase();
      
      // فیلتر جستجو (باید توی لیست دستگاه‌ها هم بگردد)
      let filtered = customers.filter(c => {
          const mainMatch = safeSearch(c.Name).includes(search.toLowerCase()) || safeSearch(c.Phone).includes(search);
          // جستجو در سریال‌های دستگاه‌ها
          const deviceMatch = c.devicesList.some(d => safeSearch(d.Serial).includes(search) || safeSearch(d.Device).includes(search));
          return mainMatch || deviceMatch;
      });

      // سورت
      if (sortConfig.key) {
          filtered.sort((a, b) => {
              const valA = a[sortConfig.key] || '';
              const valB = b[sortConfig.key] || '';
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return filtered;
  };

  const processedCustomers = getProcessedData();

  // --- پروفایل و عملیات ---
  const fetchCustomerHistory = async (phone) => {
      setHistoryLoading(true);
      try {
          const res = await api.get('/invoices/pending'); 
          // فیلتر دقیق روی شماره
          const history = res.data.filter(inv => inv.Phone === phone);
          setCustomerHistory(history);
      } catch (err) { console.error(err); }
      finally { setHistoryLoading(false); }
  }

  const handleOpenProfile = (customer) => {
      setSelectedCustomer(customer);
      fetchCustomerHistory(customer.Phone);
  }

  const handleDelete = async (id, phone) => {
    if (confirm(`آیا مطمئن هستید؟ این کار تمام سوابق شماره ${phone} را پاک می‌کند.`)) {
      try { 
          // اینجا باید منطق حذف را بر اساس نیازتان تنظیم کنید (حذف تکی یا گروهی)
          // فعلا حذف بر اساس ID اصلی
          await api.delete(`/customers/${id}`); 
          toast.success("رکورد حذف شد"); 
          fetchCustomers(); 
      } 
      catch (err) { toast.error("خطا در حذف"); }
    }
  };

  // --- دکمه‌های ابزار (کدها مشابه قبل) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const loadingToast = toast.loading("در حال پردازش...");
    try {
      await api.post('/customers/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.update(loadingToast, { render: `انجام شد ✅`, type: "success", isLoading: false, autoClose: 2000 });
      fetchCustomers();
    } catch (err) { toast.update(loadingToast, { render: "خطا", type: "error", isLoading: false, autoClose: 2000 }); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClean = async () => {
      if(confirm("پاکسازی انجام شود؟")) {
          await api.post('/tools/clean'); fetchCustomers(); toast.success("انجام شد");
      }
  }
  const handleDeleteAll = async () => {
      if(confirm("حذف کل دیتابیس؟؟")) {
          await api.delete('/customers/all'); fetchCustomers();
      }
  }

  const SortIcon = ({ columnKey }) => {
      if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-300 ml-1 inline"/>;
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-blue-600 ml-1 inline"/> : <ArrowDown size={14} className="text-blue-600 ml-1 inline"/>;
  };

  return (
    <div className="animate-fade-in-up pb-20 relative">
      
      {/* هدر */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            مدیریت مشتریان <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-200">{customers.length} نفر</span>
        </h1>
        
        <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={fetchCustomers} className="bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl transition" title="رفرش">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
            </button>
            <button onClick={() => fileInputRef.current.click()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-200 transition">
                <FileUp size={18}/> ایمپورت اکسل
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept=".xlsx" />
            <button onClick={handleClean} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-200 transition">
                <Database size={18}/> پاکسازی
            </button>
            <button onClick={handleDeleteAll} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-200 transition">
                <AlertOctagon size={18}/> حذف کل
            </button>
        </div>
      </div>

      <div className="relative mb-6">
        <input type="text" placeholder="جستجو (نام، شماره، مدل دستگاه، سریال)..." className="w-full p-4 pr-12 rounded-2xl border border-gray-200 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition" value={search} onChange={e => setSearch(e.target.value)}/>
        <Search className="absolute top-4 right-4 text-gray-400" size={22} />
      </div>

      {/* جدول جدید و مینیمال */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="p-5 cursor-pointer hover:text-blue-600" onClick={() => handleSort('Name')}>مشتری <SortIcon columnKey="Name"/></th>
                <th className="p-5">دستگاه‌ها و خدمات</th>
                <th className="p-5 text-center cursor-pointer hover:text-blue-600" onClick={() => handleSort('BuyDate')}>آخرین مراجعه <SortIcon columnKey="BuyDate"/></th>
                <th className="p-5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan="4" className="p-10 text-center text-gray-400">در حال بارگذاری اطلاعات...</td></tr> : processedCustomers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition group">
                    
                    {/* ستون 1: مشخصات فردی */}
                    <td className="p-5 align-top w-1/4">
                        <div className="flex flex-col gap-1">
                            <span 
                                onClick={() => handleOpenProfile(c)}
                                className="font-bold text-gray-800 text-base cursor-pointer hover:text-blue-600 transition flex items-center gap-2"
                            >
                                {c.Name || 'بدون نام'}
                                {c.devicesList.length > 1 && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md">{c.devicesList.length} دستگاه</span>}
                            </span>
                            <span className="font-mono text-gray-400 text-sm dir-ltr text-right flex items-center gap-1 justify-end">
                                {c.Phone} <Smartphone size={14}/>
                            </span>
                        </div>
                    </td>

                    {/* ستون 2: لیست دستگاه‌ها (زیر هم و شیک) */}
                    <td className="p-5 align-top">
                        <div className="flex flex-col gap-3">
                            {c.devicesList.map((dev, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all">
                                    {/* نام و سریال دستگاه */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-1.5 rounded text-gray-500"><Laptop size={16}/></div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 text-xs">{dev.Device !== '-' ? dev.Device : 'دستگاه نامشخص'}</span>
                                            <span className="font-mono text-[10px] text-gray-400">{dev.Serial}</span>
                                        </div>
                                    </div>

                                    {/* وضعیت‌ها (گارانتی و آنتی ویروس) */}
                                    <div className="flex items-center gap-2 text-[10px]">
                                        {/* گارانتی */}
                                        <div className={`px-2 py-1 rounded border ${dev.WarrantyDate ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                                            {dev.WarrantyDate ? `گارانتی: ${dev.WarrantyDate}` : 'بدون گارانتی'}
                                        </div>
                                        {/* آنتی ویروس */}
                                        {dev.Antivirus !== '-' && (
                                            <div className="px-2 py-1 rounded border bg-green-50 border-green-100 text-green-700 font-mono">
                                                {dev.Antivirus} ({dev.AntivirusDate})
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </td>
                    
                    {/* ستون 3: تاریخ آخرین مراجعه */}
                    <td className="p-5 text-center align-top pt-8">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-mono">
                            {c.BuyDate || '-'}
                        </span>
                    </td>

                    {/* ستون 4: حذف */}
                    <td className="p-5 text-center align-top pt-8">
                      <button onClick={() => handleDelete(c.CustomerID, c.Phone)} className="text-gray-300 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full">
                          <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
      </div>

      {/* --- مودال پروفایل (آپدیت شده برای نمایش همه دستگاه‌ها) --- */}
      {selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  
                  {/* هدر مودال */}
                  <div className="bg-gradient-to-l from-blue-700 to-blue-600 p-6 text-white flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner"><User size={32}/></div>
                          <div>
                              <h2 className="text-2xl font-bold">{selectedCustomer.Name}</h2>
                              <p className="text-blue-100 font-mono mt-1 opacity-80">{selectedCustomer.Phone}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedCustomer(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      
                      {/* لیست دستگاه‌های کاربر در پروفایل */}
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                          <Laptop size={16}/> دستگاه‌های ثبت شده ({selectedCustomer.devicesList.length})
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                          {selectedCustomer.devicesList.map((dev, idx) => (
                              <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition duration-300">
                                  <div className="flex justify-between items-start mb-3">
                                      <span className="font-bold text-gray-700">{dev.Device}</span>
                                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">{dev.Serial}</span>
                                  </div>
                                  
                                  <div className="space-y-2 text-xs">
                                      {/* وضعیت گارانتی این دستگاه */}
                                      <div className={`flex justify-between items-center p-2 rounded-lg ${dev.WarrantyDate ? 'bg-orange-50 text-orange-800' : 'bg-gray-100 text-gray-400'}`}>
                                          <span className="flex items-center gap-1"><ShieldCheck size={14}/> گارانتی</span>
                                          <span className="font-mono font-bold">{dev.WarrantyDate || 'فاقد'}</span>
                                      </div>
                                      {/* وضعیت آنتی ویروس این دستگاه */}
                                      <div className={`flex justify-between items-center p-2 rounded-lg ${dev.Antivirus !== '-' ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                          <span className="flex items-center gap-1"><ShieldAlert size={14}/> {dev.Antivirus !== '-' ? dev.Antivirus : 'آنتی‌ویروس'}</span>
                                          <span className="font-mono font-bold">{dev.AntivirusDate || 'ندارد'}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* تاریخچه سفارشات (مشترک برای همه دستگاه‌ها) */}
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                          <History size={18} className="text-blue-600"/> سوابق مالی و فاکتورها
                      </h3>
                      
                      {historyLoading ? (
                          <div className="text-center py-8 text-gray-400 animate-pulse">در حال بررسی سوابق...</div>
                      ) : customerHistory.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed">هیچ فاکتوری برای این شماره ثبت نشده است.</div>
                      ) : (
                          <div className="space-y-2">
                              {customerHistory.map((inv, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition">
                                      <div>
                                          <p className="font-bold text-gray-700 text-sm">{inv.Service}</p>
                                          <p className="text-xs text-gray-400 mt-1">{inv.Date || '---'}</p>
                                      </div>
                                      <div className="text-left">
                                          <span className="block font-bold text-blue-600 text-sm">{parseInt(inv.Amount).toLocaleString()}</span>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.Status === 'تایید شده' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                              {inv.Status}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}