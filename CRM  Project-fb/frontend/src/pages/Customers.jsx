import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Search, Trash2, FileUp, RefreshCw, Smartphone, Monitor, Shield, Calendar, PlusCircle, X, Save, ShieldCheck, Info, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const AddDeviceModal = ({ isOpen, onClose, onRefresh }) => {
  const [form, setForm] = useState({ 
    name: '', phone: '', 
    device: 'HP', custom_device: '', 
    model: '', serial: '', description: '',
    exit_date: '', 
    // بخش جدید گارانتی
    warranty_name: 'سازگار', custom_warranty: '',
    warranty_mode: 'month', warranty_months: 18, warranty_end_date: '',
    has_windows: false, antivirus_type: 'none' 
  });
  const [loading, setLoading] = useState(false);

  // لیست برندهای دستگاه
  const brands = ["HP", "Asus", "Lenovo", "Dell", "Acer", "MSI", "Apple", "Microsoft", "Samsung", "Toshiba", "Other"];
  
  // لیست شرکت‌های گارانتی (جدید)
  const warranties = ["سازگار", "آواژنگ", "مادیران", "حامی", "الماس رایان", "همراه سرویس", "شرکتی", "بدون گارانتی", "Other"];

  if (!isOpen) return null;

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm({...form, phone: val});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone.startsWith("09") || form.phone.length !== 11) return toast.error("شماره موبایل صحیح نیست (11 رقم با 09)");
    if (!form.exit_date) return toast.error("تاریخ خروج الزامی است");

    setLoading(true);
    try {
      // مدیریت "سایر" برای برند و گارانتی
      const finalDevice = form.device === "Other" ? form.custom_device : form.device;
      const finalWarranty = form.warranty_name === "Other" ? form.custom_warranty : form.warranty_name;
      
      const payload = {
          ...form,
          device: finalDevice,
          warranty_name: finalWarranty,
          exit_date: form.exit_date?.toString(), 
          warranty_end_date: form.warranty_end_date?.toString()
      };

      await api.post('/api/customers/', payload);
      toast.success("دستگاه با موفقیت پذیرش شد ✅");
      onRefresh(); onClose();
      setForm({ name: '', phone: '', device: 'HP', custom_device: '', model: '', serial: '', description: '', warranty_name: 'سازگار', custom_warranty: '', exit_date: '', warranty_mode: 'month', warranty_months: 18, warranty_end_date: '', has_windows: false, antivirus_type: 'none' });
    } catch (err) {
      toast.error("خطا: شماره تکراری یا مشکل سرور");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="bg-blue-600 p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2"><Monitor size={24}/> پذیرش دستگاه نو</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X/></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
            <form id="add-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* ردیف ۱: مشتری */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">نام مشتری</label>
                        <input required className="input-field w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="مثلاً: علی احمدی"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس (۱۱ رقم)</label>
                        <input type="tel" maxLength="11" required className="input-field w-full p-3 border rounded-xl font-mono text-left bg-gray-50 focus:bg-white outline-none" value={form.phone} onChange={handlePhoneInput} placeholder="09xxxxxxxxx"/>
                    </div>
                </div>

                {/* ردیف ۲: مشخصات دستگاه */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">برند</label>
                        <select className="w-full p-3 border rounded-xl bg-white outline-none" value={form.device} onChange={e=>setForm({...form, device:e.target.value})}>
                            {brands.map(b => <option key={b} value={b}>{b === "Other" ? "سایر (تایپ کنید)..." : b}</option>)}
                        </select>
                        {form.device === "Other" && (
                            <input className="w-full p-3 border rounded-xl mt-2 outline-none" placeholder="برند جدید..." value={form.custom_device} onChange={e=>setForm({...form, custom_device:e.target.value})} />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">مدل دقیق</label>
                        <input className="w-full p-3 border rounded-xl bg-white outline-none" placeholder="مثلاً: Victus 15" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">سریال</label>
                        <input className="w-full p-3 border rounded-xl bg-white outline-none font-mono text-left" placeholder="S/N..." value={form.serial} onChange={e=>setForm({...form, serial:e.target.value})}/>
                    </div>
                </div>

                {/* ردیف ۳: توضیحات */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات / اقلام همراه</label>
                    <textarea className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none h-16 resize-none" placeholder="شارژر، کارتن، خط و خش..." value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea>
                </div>

                <div className="border-t pt-2"></div>

                {/* ردیف ۴: تاریخ و گارانتی */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">تاریخ خروج</label>
                        <DatePicker 
                            value={form.exit_date} onChange={(date) => setForm({...form, exit_date: date})}
                            calendar={persian} locale={persian_fa} calendarPosition="bottom-right"
                            inputClass="w-full p-3 border rounded-xl text-center font-mono outline-none bg-white cursor-pointer" placeholder="انتخاب تاریخ"
                        />
                    </div>
                    
                    {/* انتخاب نام گارانتی (جدید) */}
                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">شرکت گارانتی</label>
                        <select className="w-full p-3 border rounded-xl bg-white outline-none" value={form.warranty_name} onChange={e=>setForm({...form, warranty_name:e.target.value})}>
                            {warranties.map(w => <option key={w} value={w}>{w === "Other" ? "سایر (تایپ کنید)..." : w}</option>)}
                        </select>
                        {form.warranty_name === "Other" && (
                            <input className="w-full p-3 border rounded-xl mt-2 outline-none" placeholder="نام گارانتی..." value={form.custom_warranty} onChange={e=>setForm({...form, custom_warranty:e.target.value})} />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">مدت/پایان گارانتی</label>
                        <div className="flex gap-2 mb-2">
                            <button type="button" onClick={()=>setForm({...form, warranty_mode:'month'})} className={`flex-1 py-1.5 text-xs rounded-lg transition ${form.warranty_mode==='month'?'bg-blue-600 text-white':'bg-gray-200'}`}>مدت (ماه)</button>
                            <button type="button" onClick={()=>setForm({...form, warranty_mode:'date'})} className={`flex-1 py-1.5 text-xs rounded-lg transition ${form.warranty_mode==='date'?'bg-blue-600 text-white':'bg-gray-200'}`}>تاریخ</button>
                        </div>
                        {form.warranty_mode === 'month' ? (
                            <div className="relative">
                                <input type="number" className="w-full p-3 border rounded-xl text-center outline-none" value={form.warranty_months} onChange={e=>setForm({...form, warranty_months:e.target.value})}/>
                                <span className="absolute left-3 top-3.5 text-gray-400 text-sm">ماه</span>
                            </div>
                        ) : (
                            <DatePicker 
                                value={form.warranty_end_date} onChange={(date) => setForm({...form, warranty_end_date: date})}
                                calendar={persian} locale={persian_fa} calendarPosition="bottom-left"
                                inputClass="w-full p-3 border rounded-xl text-center font-mono outline-none bg-white cursor-pointer" placeholder="انتخاب تاریخ"
                            />
                        )}
                    </div>
                </div>

                {/* ردیف ۵: خدمات */}
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">خدمات نرم‌افزاری:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${form.has_windows ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                            <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={form.has_windows} onChange={e=>setForm({...form, has_windows: e.target.checked})}/>
                            <span className="font-bold text-gray-700">نصب ویندوز (Win)</span>
                        </label>
                        
                        <div className={`p-4 rounded-xl border-2 transition ${form.antivirus_type!=='none' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={20} className={form.antivirus_type!=='none'?'text-green-600':'text-gray-400'}/>
                                <span className="font-bold text-gray-700">آنتی‌ویروس</span>
                            </div>
                            <select className="w-full p-2 border rounded-lg bg-white text-sm outline-none" value={form.antivirus_type} onChange={e=>setForm({...form, antivirus_type:e.target.value})}>
                                <option value="none">ندارد</option>
                                <option value="single">تک کاربره</option>
                                <option value="double">دو کاربره</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <div className="p-5 border-t bg-gray-50 shrink-0">
             <button form="add-form" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg flex justify-center gap-2">
                {loading ? 'در حال ثبت...' : <><Save/> ثبت نهایی</>}
             </button>
        </div>
      </div>
    </div>
  );
};

export default function Customers() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  const handleDelete = async (id) => {
    if(confirm('آیا حذف شود؟')) { await api.delete(`/api/customers/${id}/`); fetchData(); toast.success("حذف شد"); }
  };

  const filtered = data.filter(c => c.name?.includes(search) || c.phone?.includes(search) || c.serial?.includes(search));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AddDeviceModal isOpen={showModal} onClose={()=>setShowModal(false)} onRefresh={fetchData} />

      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full xl:w-96 group">
          <input className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
            placeholder="جستجو نام، موبایل، سریال..." value={search} onChange={e => setSearch(e.target.value)}/>
          <Search className="absolute right-4 top-3.5 text-gray-400" size={20}/>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
           <button onClick={() => setShowModal(true)} className="flex-1 xl:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition">
             <PlusCircle size={18}/> پذیرش دستگاه نو
           </button>
           <button onClick={() => fileRef.current.click()} className="flex-1 xl:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition">
             <FileUp size={18}/> ایمپورت اکسل
           </button>
           <input type="file" ref={fileRef} hidden onChange={handleImport} accept=".xlsx"/>
           <button onClick={fetchData} className="bg-white border p-3 rounded-xl hover:bg-gray-50"><RefreshCw size={20} className={loading?"animate-spin":""}/></button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm min-w-[1000px]">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
              <tr><th className="p-6">مشتری</th><th className="p-6">دستگاه</th><th className="p-6">گارانتی / خروج</th><th className="p-6">سرویس‌ها</th><th className="p-6">توضیحات</th><th className="p-6">عملیات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/50 transition">
                  <td className="p-6">
                    <div className="font-bold text-gray-800">{c.name}</div>
                    <div className="text-gray-400 text-xs font-mono mt-1 flex items-center gap-1"><Smartphone size={12}/> {c.phone}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-gray-700">{c.device} <span className="font-normal text-gray-500 text-xs">({c.model || '---'})</span></div>
                    <div className="text-gray-400 text-xs font-mono mt-1 border border-gray-200 rounded px-1 w-fit bg-gray-50">{c.serial || '---'}</div>
                  </td>
                  <td className="p-6">
                      <div className="flex flex-col gap-1.5 text-xs">
                          {c.warranty_name && <span className="flex items-center gap-1 text-gray-700"><Award size={12} className="text-orange-500"/> {c.warranty_name}</span>}
                          <span className="text-blue-600 font-bold">پایان: <span className="font-mono">{c.jalali_warranty_end}</span></span>
                          <span className="text-gray-400">خروج: {c.jalali_exit_date}</span>
                      </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2 mb-1.5">
                        {c.has_windows && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Win</span>}
                        {c.antivirus_type === 'single' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">NOD 1</span>}
                        {c.antivirus_type === 'double' && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">NOD 2</span>}
                    </div>
                    {c.antivirus_type !== 'none' && <div className="text-[10px] text-gray-400 font-mono">انقضا: {c.jalali_expiry_date}</div>}
                  </td>
                  <td className="p-6 max-w-[200px]">
                      {c.description ? (
                          <div className="text-xs text-gray-500 truncate" title={c.description}>
                             <Info size={14} className="inline mr-1 text-blue-400"/> {c.description}
                          </div>
                      ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="p-6"><button onClick={()=>handleDelete(c.id)} className="text-red-300 hover:text-red-500 bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && <div className="p-10 text-center text-gray-400">موردی یافت نشد</div>}
      </div>
    </div>
  );
}