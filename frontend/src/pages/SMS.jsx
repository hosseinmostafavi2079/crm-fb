import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MessageSquare, Send, Users, CheckCircle, AlertTriangle, Settings, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SMS() {
  const [target, setTarget] = useState('single'); 
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  
  // تنظیمات پنل
  const [config, setConfig] = useState({ api_key: '', sender: '' });
  const [savingConfig, setSavingConfig] = useState(false);

  // دریافت اطلاعات اولیه (مشتریان + تنظیمات)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCust, resConf] = await Promise.all([
            api.get('/customers'),
            api.get('/sms/config')
        ]);
        setCustomers(Array.isArray(resCust.data) ? resCust.data : []);
        if (resConf.data) setConfig(resConf.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  // ذخیره تنظیمات پنل
  const handleSaveConfig = async () => {
      if (!config.api_key) return toast.error("API Key نمی‌تواند خالی باشد");
      setSavingConfig(true);
      try {
          await api.post('/sms/config', config);
          toast.success("تنظیمات پنل پیامک ذخیره شد ✅");
      } catch (err) {
          toast.error("خطا در ذخیره تنظیمات");
      } finally {
          setSavingConfig(false);
      }
  }

  const handleSendSMS = async () => {
    if (!config.api_key) return toast.error("ابتدا API Key را در تنظیمات وارد و ذخیره کنید");
    if (!message) return toast.error("متن پیام را وارد کنید");

    let receptor = '';
    let count = 0;

    if (target === 'single') {
        if (!phone) return toast.error("شماره گیرنده را وارد کنید");
        receptor = phone;
        count = 1;
    } else {
        let targetList = [];
        if (target === 'all') targetList = customers;
        else if (target === 'antivirus') targetList = customers.filter(c => c.Antivirus && c.Antivirus !== '-');
        else if (target === 'warranty') targetList = customers.filter(c => c.Device && c.Device !== '-');

        const phones = targetList.map(c => c.Phone).filter(p => p && p.length >= 10);
        
        if (phones.length === 0) return toast.error("هیچ مشتری با این شرایط یافت نشد");
        
        receptor = phones.join(',');
        count = phones.length;
    }

    setLoading(true);
    try {
      await api.post('/sms/send', { receptor, message });
      toast.success(`پیام با موفقیت برای ${count} نفر ارسال شد`);
      if(target === 'single') setPhone('');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "خطا در ارسال پیامک";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-blue-600" size={32}/>
        <h1 className="text-2xl font-bold text-gray-800">پنل ارسال پیامک هوشمند</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست: فرم ارسال */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            {/* انتخاب گیرنده */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={18}/> گیرندگان:
                </label>
                <div className="flex flex-wrap gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    {[
                        { id: 'single', label: 'تکی (تست)' },
                        { id: 'antivirus', label: 'فقط آنتی‌ویروس‌دارها' },
                        { id: 'warranty', label: 'فقط گارانتی‌دارها' },
                        { id: 'all', label: 'همه مشتریان' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setTarget(opt.id)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                                target === opt.id 
                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100' 
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ورودی شماره (فقط تکی) */}
            {target === 'single' && (
                <div className="mb-6 animate-fade-in-up">
                    <input 
                        type="text" 
                        className="w-full p-4 border rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none text-left dir-ltr font-mono text-lg tracking-widest placeholder:tracking-normal"
                        placeholder="0912..."
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
            )}

            {/* تعداد گیرندگان گروهی */}
            {target !== 'single' && (
                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl flex items-center gap-2 text-sm animate-fade-in-up">
                    <CheckCircle size={18}/>
                    گیرندگان: <span className="font-bold text-lg mx-1">{
                        target === 'all' ? customers.length : 
                        target === 'antivirus' ? customers.filter(c => c.Antivirus && c.Antivirus !== '-').length :
                        customers.filter(c => c.Device && c.Device !== '-').length
                    }</span> نفر
                </div>
            )}

            {/* متن پیام */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">متن پیامک:</label>
                <textarea 
                    className="w-full p-4 border rounded-xl focus:border-blue-500 outline-none h-40 resize-none leading-relaxed"
                    placeholder="متن پیام..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                ></textarea>
                <div className="text-left text-xs text-gray-400 mt-1">{message.length} کاراکتر</div>
            </div>

            <button 
                onClick={handleSendSMS} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2 disabled:bg-gray-400"
            >
                {loading ? '⏳ ارسال...' : <><Send size={20}/> ارسال پیامک</>}
            </button>
        </div>

        {/* ستون چپ: تنظیمات و آمار */}
        <div className="space-y-6">
            
            {/* باکس تنظیمات API */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <Settings size={18} className="text-gray-500"/> تنظیمات اتصال
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">API Key کاوه نگار</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-lg text-xs font-mono bg-gray-50 focus:bg-white outline-none dir-ltr"
                            placeholder="کلید طولانی..."
                            value={config.api_key || ''}
                            onChange={e => setConfig({...config, api_key: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">شماره فرستنده (اختیاری)</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-lg text-xs font-mono bg-gray-50 focus:bg-white outline-none dir-ltr"
                            placeholder="1000..."
                            value={config.sender || ''}
                            onChange={e => setConfig({...config, sender: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="w-full bg-gray-800 hover:bg-black text-white py-2 rounded-lg text-sm font-bold transition flex justify-center items-center gap-2"
                    >
                        {savingConfig ? '...' : <><Save size={16}/> ذخیره تنظیمات</>}
                    </button>
                </div>
            </div>

            {/* آمار */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-gray-600 text-sm">
                <h3 className="font-bold text-gray-800 mb-3">آمار مشتریان:</h3>
                <ul className="space-y-2">
                    <li className="flex justify-between"><span>کل:</span> <span className="font-bold">{customers.length}</span></li>
                    <li className="flex justify-between"><span>آنتی‌ویروس:</span> <span className="font-bold text-green-600">{customers.filter(c => c.Antivirus && c.Antivirus !== '-').length}</span></li>
                </ul>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-xs leading-5">
                <AlertTriangle size={16} className="inline mb-1 ml-1"/>
                اگر شماره‌ای در لیست سیاه مخابرات باشد، ارسال انجام نمی‌شود (مگر خط خدماتی باشد).
            </div>
        </div>
      </div>
    </div>
  );
}