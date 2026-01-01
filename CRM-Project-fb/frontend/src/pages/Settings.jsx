import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Settings as Icon, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [config, setConfig] = useState({ sms_api_key: '', backup_interval_hours: 24 });

  useEffect(() => {
    // دریافت اولین کانفیگ
    api.get('/api/config/').then(res => {
        if(res.data.length > 0) setConfig(res.data[0]);
    });
  }, []);

  const handleSave = async () => {
      try {
          if(config.id) {
              await api.put(`/api/config/${config.id}/`, config);
          } else {
              await api.post('/api/config/', config);
          }
          toast.success("تنظیمات ذخیره شد");
      } catch(e) { toast.error("خطا در ذخیره"); }
  };

  return (
    <div className="max-w-3xl">
       <div className="flex items-center gap-2 mb-6">
         <Icon className="text-gray-600"/> <h1 className="text-2xl font-bold">تنظیمات سیستم</h1>
       </div>
       
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
           <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">کلید API پنل پیامک</label>
               <input type="text" className="w-full p-3 border rounded-xl font-mono text-left bg-gray-50" value={config.sms_api_key} onChange={e=>setConfig({...config, sms_api_key: e.target.value})} />
           </div>
           
           <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">بازه بکاپ‌گیری خودکار (ساعت)</label>
               <input type="number" className="w-full p-3 border rounded-xl bg-gray-50" value={config.backup_interval_hours} onChange={e=>setConfig({...config, backup_interval_hours: e.target.value})} />
           </div>

           <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition">
               <Save size={18}/> ذخیره تغییرات
           </button>
       </div>
    </div>
  );
}