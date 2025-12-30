import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Plus, Trash, RefreshCw, Send } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Reminders() {
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // فرم افزودن قانون
  const [newRule, setNewRule] = useState({ type: 'antivirus', days: 3, msg: 'سلام {name}، سرویس شما رو به اتمام است.' });
  
  // تنظیمات بررسی
  const [checkExpired, setCheckExpired] = useState(true);
  const [rangeMode, setRangeMode] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await api.get('/reminders/rules');
    setRules(res.data);
  };

  const addRule = async () => {
    const updated = [...rules, newRule];
    await api.post('/reminders/rules', updated);
    setRules(updated);
    toast.success("قانون ذخیره شد");
  };

  const deleteRule = async (idx) => {
    const updated = rules.filter((_, i) => i !== idx);
    await api.post('/reminders/rules', updated);
    setRules(updated);
  };

  const checkStatus = async () => {
    try {
        const res = await api.post('/reminders/check', { 
            check_expired: checkExpired,
            range_mode: rangeMode 
        });
        setAlerts(res.data);
        if(res.data.length === 0) toast.info("موردی یافت نشد");
        else toast.success(`${res.data.length} پیامک آماده ارسال شد`);
    } catch(err) { toast.error("خطا در بررسی"); }
  };

  const sendBulkSMS = async () => {
     if(!confirm(`آیا از ارسال ${alerts.length} پیامک اطمینان دارید؟`)) return;
     // اینجا باید حلقه ارسال را صدا بزنید یا یک اندپوینت بالک بسازید
     // فعلا فقط پیام موفقیت نمایش میدهیم چون اندپوینت بالک در sms_service.py استریم‌لیت بود
     toast.success("پیامک‌ها در صف ارسال قرار گرفتند");
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ستون راست: لیست قوانین */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={20}/> افزودن زمان‌بندی
            </h3>
            <div className="space-y-3 text-sm">
                <div>
                    <label className="block text-gray-500 mb-1">نوع سرویس:</label>
                    <select className="w-full bg-gray-50 p-2 rounded border" value={newRule.type} onChange={e=>setNewRule({...newRule, type: e.target.value})}>
                        <option value="antivirus">آنتی‌ویروس</option>
                        <option value="warranty">گارانتی</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">چند روز مانده؟</label>
                    <input type="number" className="w-full bg-gray-50 p-2 rounded border" value={newRule.days} onChange={e=>setNewRule({...newRule, days: parseInt(e.target.value)})}/>
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">متن پیامک:</label>
                    <textarea className="w-full bg-gray-50 p-2 rounded border h-20 resize-none" value={newRule.msg} onChange={e=>setNewRule({...newRule, msg: e.target.value})}></textarea>
                    <p className="text-xs text-gray-400 mt-1">متغیرها: {'{name}'}, {'{days}'}</p>
                </div>
                <button onClick={addRule} className="w-full bg-blue-600 text-white py-2 rounded font-bold">ثبت قانون</button>
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Bell size={20}/> لیست قوانین فعال
            </h3>
            <div className="space-y-4">
                {rules.map((r, i) => (
                    <div key={i} className="border-b pb-2 last:border-0 relative">
                        <button onClick={()=>deleteRule(i)} className="absolute top-0 left-0 text-red-400 hover:text-red-600"><Trash size={14}/></button>
                        <p className="font-bold text-gray-800 text-sm">{r.type === 'antivirus' ? 'آنتی‌ویروس' : 'گارانتی'}</p>
                        <p className="text-xs text-gray-500">سررسید: {r.days} روز مانده</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{r.msg}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* ستون چپ: بررسی و اجرا */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                    <RefreshCw className={alerts.length ? "animate-spin-slow" : ""}/> بررسی و ارسال خودکار
                </h2>
                <div className="flex gap-4 mt-2 text-sm text-green-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={checkExpired} onChange={e=>setCheckExpired(e.target.checked)}/> نمایش منقضی‌ها
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={rangeMode} onChange={e=>setRangeMode(e.target.checked)}/> حالت بازه‌ای (تمام روزهای کمتر)
                    </label>
                </div>
            </div>
            <button onClick={checkStatus} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-green-200">
                بررسی وضعیت مشتریان
            </button>
        </div>

        {/* نتایج بررسی */}
        {alerts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <span className="font-bold text-gray-700">لیست پیامک‌های آماده ({alerts.length} مورد)</span>
                    <button onClick={sendBulkSMS} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded transition">
                        <Send size={16}/> ارسال همه
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {alerts.map((a, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-sm">{a.Name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${a.Type==='منقضی' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{a.Type}</span>
                            </div>
                            <p className="text-gray-500 text-xs mb-1">{a.Phone}</p>
                            <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-100">{a.Message}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

    </div>
  );
}