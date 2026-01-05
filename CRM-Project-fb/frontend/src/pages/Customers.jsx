import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Search, Trash2, FileUp, RefreshCw, Smartphone, Monitor, Shield, Calendar, PlusCircle, X, Save, ShieldCheck, Info, Eye, RotateCcw, UserCheck, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// --- مودال پذیرش هوشمند (مرحله‌ای) ---
const AddDeviceModal = ({ isOpen, onClose, onRefresh }) => {
  const [step, setStep] = useState(1); // 1: Phone check, 2: Details
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // فرم نهایی
  const [form, setForm] = useState({ 
    name: '', device: 'HP', custom_device: '', 
    model: '', serial: '', description: '', exit_date: '', 
    warranty_name: 'سازگار', custom_warranty: '',
    warranty_mode: 'month', warranty_months: 18, warranty_end_date: '',
    has_windows: false, antivirus_type: 'none' 
  });
  
  const [existingCustomer, setExistingCustomer] = useState(null);

  const brands = ["HP", "Asus", "Lenovo", "Dell", "Acer", "MSI", "Apple", "Microsoft", "Samsung", "Toshiba", "Other"];
  const warranties = ["سازگار", "آواژنگ", "مادیران", "حامی", "الماس رایان", "همراه سرویس", "شرکتی", "بدون گارانتی", "Other"];

  // ریست کردن هنگام باز شدن
  useEffect(() => {
      if(isOpen) {
          setStep(1); setPhone(''); setExistingCustomer(null);
          setForm({ name: '', device: 'HP', custom_device: '', model: '', serial: '', description: '', exit_date: '', warranty_name: 'سازگار', custom_warranty: '', warranty_mode: 'month', warranty_months: 18, warranty_end_date: '', has_windows: false, antivirus_type: 'none' });
      }
  }, [isOpen]);

  if (!isOpen) return null;

  // مرحله ۱: چک کردن شماره
  const handleCheckPhone = async (e) => {
      e.preventDefault();
      if (!phone.startsWith("09") || phone.length !== 11) return toast.error("شماره صحیح نیست");
      
      setLoading(true);
      try {
          // جستجو در بک‌اند
          const res = await api.get(`/api/customers/?search=${phone}`);
          // پیدا کردن تطابق دقیق
          const found = res.data.find(c => c.phone === phone);
          
          if (found) {
              setExistingCustomer(found);
              setForm(prev => ({ ...prev, name: found.name }));
              toast.info(`مشتری سابقه دار: ${found.name}`);
          } else {
              setExistingCustomer(null);
          }
          setStep(2);
      } catch (err) {
          toast.error("خطا در بررسی شماره");
      } finally { setLoading(false); }
  };

  // مرحله ۲: ثبت نهایی
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.exit_date) return toast.error("تاریخ خروج الزامی است");

    setLoading(true);
    try {
      const finalDevice = form.device === "Other" ? form.custom_device : form.device;
      const finalWarranty = form.warranty_name === "Other" ? form.custom_warranty : form.warranty_name;
      
      const payload = {
          phone: phone, // شماره از مرحله ۱ میاد
          ...form,
          device: finalDevice,
          warranty_name: finalWarranty,
          exit_date: form.exit_date?.toString(), 
          warranty_end_date: form.warranty_end_date?.toString()
      };

      await api.post('/api/customers/', payload);
      toast.success("پذیرش انجام شد ✅");
      onRefresh(); onClose();
    } catch (err) {
      toast.error("خطا در ثبت");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-blue-600 p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2"><Monitor size={24}/> پذیرش دستگاه نو</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X/></button>
        </div>

        {step === 1 ? (
            // --- UI مرحله اول: ورود شماره ---
            <div className="p-10 flex flex-col items-center justify-center space-y-6">
                <div className="bg-blue-50 p-4 rounded-full"><Smartphone size={48} className="text-blue-600"/></div>
                <h3 className="text-xl font-bold text-gray-800">شماره موبایل مشتری را وارد کنید</h3>
                <form onSubmit={handleCheckPhone} className="w-full max-w-md space-y-4">
                    <input autoFocus type="tel" maxLength="11" className="input-field w-full p-4 text-center text-2xl tracking-widest font-mono border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none" 
                           value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g, ''))} placeholder="09xxxxxxxxx"/>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg flex justify-center gap-2">
                        {loading ? 'در حال بررسی...' : 'بررسی و ادامه'}
                    </button>
                </form>
            </div>
        ) : (
            // --- UI مرحله دوم: ورود اطلاعات ---
            <>
                <div className="overflow-y-auto p-6 space-y-6">
                    {/* هدر وضعیت مشتری */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <button onClick={()=>setStep(1)} className="text-gray-400 hover:text-gray-600 p-2"><ArrowRight/></button>
                        <div className="flex-1">
                            <span className="block text-xs text-gray-400">شماره موبایل</span>
                            <span className="text-lg font-mono font-bold text-gray-800">{phone}</span>
                        </div>
                        {existingCustomer ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                <UserCheck size={18}/> <span className="font-bold text-sm">مشتری سابق</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                <UserPlus size={18}/> <span className="font-bold text-sm">مشتری جدید</span>
                            </div>
                        )}
                    </div>

                    <form id="add-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* نام مشتری */}
                        <div>
                            <label className="block text-sm font-bold mb-2">نام مشتری</label>
                            <input required className="input-field w-full p-3 border rounded-xl" 
                                   value={form.name} onChange={e=>setForm({...form, name:e.target.value})} 
                                   placeholder="نام و نام خانوادگی"/>
                        </div>

                        {/* اطلاعات دستگاه */}
                        <div className="bg-gray-50 p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-bold mb-2">برند</label><select className="w-full p-3 border rounded-xl bg-white" value={form.device} onChange={e=>setForm({...form, device:e.target.value})}>{brands.map(b => <option key={b} value={b}>{b}</option>)}</select>{form.device==="Other" && <input className="w-full mt-2 p-2 border rounded" placeholder="نام برند" onChange={e=>setForm({...form, custom_device:e.target.value})}/>}</div>
                            <div><label className="block text-sm font-bold mb-2">مدل</label><input className="w-full p-3 border rounded-xl bg-white" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}/></div>
                            <div><label className="block text-sm font-bold mb-2">سریال</label><input className="w-full p-3 border rounded-xl bg-white" value={form.serial} onChange={e=>setForm({...form, serial:e.target.value})}/></div>
                        </div>

                        {/* توضیحات */}
                        <div><label className="block text-sm font-bold mb-2">توضیحات</label><textarea className="w-full p-3 border rounded-xl" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/></div>

                        {/* تاریخ و گارانتی */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-sm font-bold text-blue-800 mb-2">تاریخ خروج</label><DatePicker value={form.exit_date} onChange={(d)=>setForm({...form, exit_date:d})} calendar={persian} locale={persian_fa} inputClass="w-full p-3 border rounded-xl text-center"/></div>
                            <div><label className="block text-sm font-bold text-blue-800 mb-2">گارانتی</label><select className="w-full p-3 border rounded-xl" value={form.warranty_name} onChange={e=>setForm({...form, warranty_name:e.target.value})}>{warranties.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
                            <div>
                                <label className="block text-sm font-bold text-blue-800 mb-2">مدت/پایان</label>
                                <div className="flex gap-2 mb-2"><button type="button" onClick={()=>setForm({...form, warranty_mode:'month'})} className={`flex-1 py-1 text-xs rounded ${form.warranty_mode==='month'?'bg-blue-600 text-white':'bg-gray-200'}`}>ماه</button><button type="button" onClick={()=>setForm({...form, warranty_mode:'date'})} className={`flex-1 py-1 text-xs rounded ${form.warranty_mode==='date'?'bg-blue-600 text-white':'bg-gray-200'}`}>تاریخ</button></div>
                                {form.warranty_mode==='month'?<input type="number" className="w-full p-3 border rounded-xl text-center" value={form.warranty_months} onChange={e=>setForm({...form, warranty_months:e.target.value})}/>:<DatePicker value={form.warranty_end_date} onChange={(d)=>setForm({...form, warranty_end_date:d})} calendar={persian} locale={persian_fa} inputClass="w-full p-3 border rounded-xl text-center"/>}
                            </div>
                        </div>

                        {/* سرویس‌ها */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer ${form.has_windows?'border-blue-500 bg-blue-50':'border-gray-100'}`}><input type="checkbox" checked={form.has_windows} onChange={e=>setForm({...form, has_windows:e.target.checked})}/><span>نصب ویندوز</span></label>
                            <div className="p-4 border-2 rounded-xl"><div className="flex items-center gap-2 mb-2"><ShieldCheck size={20}/><span className="font-bold">آنتی‌ویروس</span></div><select className="w-full p-2 border rounded" value={form.antivirus_type} onChange={e=>setForm({...form, antivirus_type:e.target.value})}><option value="none">ندارد</option><option value="single">تک کاربره</option><option value="double">دو کاربره</option></select></div>
                        </div>
                    </form>
                </div>
                <div className="p-5 border-t bg-gray-50 shrink-0">
                    <button form="add-form" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg flex justify-center gap-2">
                        {loading ? '...' : <><Save/> ثبت نهایی</>}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

// --- مودال تمدید (بدون تغییر) ---
const RenewModal = ({ device, onClose, onRefresh }) => {
    const [type, setType] = useState('antivirus'); 
    const [months, setMonths] = useState(12);
    const [desc, setDesc] = useState('');
    const [userCount, setUserCount] = useState(1);
    const [loading, setLoading] = useState(false);
    if (!device) return null;
    const handleRenew = async () => {
        setLoading(true);
        try {
            await api.post(`/api/customers/1/renew_service/`, { 
                device_id: device.id, service_type: type, duration_months: months, description: desc, user_count: userCount
            });
            toast.success("تمدید شد ✅"); onRefresh(); onClose();
        } catch (err) { toast.error("خطا در تمدید"); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><RotateCcw className="text-blue-600"/> تمدید خدمات</h3>
                <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">دستگاه: <span className="font-bold text-gray-800">{device.device_name}</span></p>
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    <button onClick={()=>setType('antivirus')} className={`flex-1 py-2 rounded-md text-sm transition ${type==='antivirus'?'bg-white shadow text-blue-600':'text-gray-500'}`}>آنتی‌ویروس</button>
                    <button onClick={()=>setType('warranty')} className={`flex-1 py-2 rounded-md text-sm transition ${type==='warranty'?'bg-white shadow text-orange-600':'text-gray-500'}`}>گارانتی</button>
                </div>
                <div className="space-y-4">
                    <div><label className="block text-sm font-bold mb-1">مدت (ماه)</label><select className="w-full p-2 border rounded-lg bg-white" value={months} onChange={e=>setMonths(e.target.value)}><option value="6">6 ماه</option><option value="12">12 ماه</option><option value="18">18 ماه</option><option value="24">24 ماه</option></select></div>
                    {type === 'antivirus' && <div><label className="block text-sm font-bold mb-1">تعداد کاربر</label><div className="flex gap-2"><label className="flex-1 border p-2 rounded cursor-pointer text-center"><input type="radio" checked={userCount===1} onChange={()=>setUserCount(1)} hidden/> تک</label><label className="flex-1 border p-2 rounded cursor-pointer text-center"><input type="radio" checked={userCount===2} onChange={()=>setUserCount(2)} hidden/> دو</label></div></div>}
                    {type === 'warranty' && <div><label className="block text-sm font-bold mb-1">توضیحات</label><textarea className="w-full p-2 border rounded-lg h-20" value={desc} onChange={e=>setDesc(e.target.value)}></textarea></div>}
                </div>
                <div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 py-3 border rounded-xl">لغو</button><button onClick={handleRenew} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">{loading?'...':'ثبت'}</button></div>
            </div>
        </div>
    );
};

// --- مودال سوابق (بدون تغییر) ---
const HistoryModal = ({ customer, onClose, onRenew }) => {
    if (!customer) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-slate-800 p-5 flex justify-between items-center text-white shrink-0">
                    <div><h2 className="text-xl font-bold flex items-center gap-2"><Eye size={24}/> سوابق: {customer.name}</h2><span className="text-sm text-slate-400 font-mono mt-1 block">{customer.phone}</span></div><button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X/></button>
                </div>
                <div className="overflow-auto bg-slate-50 p-0">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-white border-b text-gray-500 sticky top-0 shadow-sm z-10"><tr><th className="p-4">#</th><th className="p-4">دستگاه</th><th className="p-4">سریال</th><th className="p-4">گارانتی</th><th className="p-4">خروج</th><th className="p-4">سرویس</th><th className="p-4">عملیات</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {customer.devices?.map((dev, idx) => (
                                <tr key={dev.id} className="bg-white hover:bg-blue-50 transition"><td className="p-4 text-gray-400 font-mono">{idx + 1}</td><td className="p-4"><div className="font-bold">{dev.device_name}</div><div className="text-xs text-gray-500">{dev.model}</div></td><td className="p-4 font-mono text-gray-600">{dev.serial || '---'}</td><td className="p-4"><div className="flex flex-col text-xs"><span className="font-bold">{dev.warranty_name}</span><span className="text-blue-600">{dev.jalali_warranty_end}</span></div></td><td className="p-4 font-mono text-gray-600">{dev.jalali_exit_date}</td><td className="p-4"><div className="flex gap-1">{dev.has_windows && <span className="bg-blue-100 text-blue-800 px-1 rounded text-[10px]">Win</span>}{dev.antivirus_type!=='none' && <span className="bg-green-100 text-green-800 px-1 rounded text-[10px]">NOD</span>}</div></td><td className="p-4"><button onClick={()=>onRenew(dev)} className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"><RotateCcw size={14}/> تمدید</button></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- کامپوننت اصلی ---
export default function Customers() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [renewDevice, setRenewDevice] = useState(null);
  const fileRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/api/customers/'); setData(res.data); } 
    catch { toast.error("خطا در دریافت"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleImport = async (e) => {
    if(!e.target.files[0]) return;
    const fd = new FormData(); fd.append("file", e.target.files[0]);
    const tid = toast.loading("در حال ایمپورت...");
    try { await api.post('/api/customers/import_excel/', fd); toast.update(tid, {render: "انجام شد", type: "success", isLoading: false, autoClose: 2000}); fetchData(); } 
    catch { toast.update(tid, {render: "خطا", type: "error", isLoading: false, autoClose: 2000}); }
    e.target.value = null;
  };

  const handleDelete = async (id) => { if(confirm('حذف شود؟')) { await api.delete(`/api/customers/${id}/`); fetchData(); toast.success("حذف شد"); } };
  const filtered = data.filter(c => c.name?.includes(search) || c.phone?.includes(search));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AddDeviceModal isOpen={showModal} onClose={()=>setShowModal(false)} onRefresh={fetchData} />
      <HistoryModal customer={selectedCustomer} onClose={()=>setSelectedCustomer(null)} onRenew={setRenewDevice} />
      <RenewModal device={renewDevice} onClose={()=>setRenewDevice(null)} onRefresh={()=>{fetchData(); setSelectedCustomer(null);}} />

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <div className="relative w-96"><input className="w-full pl-10 pr-4 py-3 rounded-xl border" placeholder="جستجو..." value={search} onChange={e=>setSearch(e.target.value)}/><Search className="absolute right-4 top-3.5 text-gray-400" size={20}/></div>
        <div className="flex gap-3"><button onClick={()=>setShowModal(true)} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex gap-2"><PlusCircle/> پذیرش نو</button><button onClick={()=>fileRef.current.click()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex gap-2"><FileUp/> اکسل</button><input type="file" ref={fileRef} hidden onChange={handleImport} accept=".xlsx"/><button onClick={fetchData} className="bg-white border p-3 rounded-xl"><RefreshCw/></button></div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="p-6">مشتری</th><th className="p-6">تعداد خرید</th><th className="p-6 text-center">آخرین مراجعه</th><th className="p-6">عملیات</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-blue-50 cursor-pointer" onClick={()=>setSelectedCustomer(c)}>
                  <td className="p-6 font-bold text-lg text-gray-700">{c.name}<div className="text-gray-400 text-xs font-mono">{c.phone}</div></td>
                  <td className="p-6"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{c.devices?.length || 0} دستگاه</span></td>
                  <td className="p-6 text-center text-gray-500 font-mono text-xs">{c.devices?.length > 0 ? c.devices[c.devices.length-1].jalali_exit_date : '-'}</td>
                  <td className="p-6 flex items-center gap-3"><button onClick={(e)=>{e.stopPropagation(); setSelectedCustomer(c)}} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex gap-2"><Eye size={16}/> سوابق</button><button onClick={(e)=>{e.stopPropagation(); handleDelete(c.id)}} className="text-red-300 hover:text-red-500 p-2"><Trash2/></button></td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}