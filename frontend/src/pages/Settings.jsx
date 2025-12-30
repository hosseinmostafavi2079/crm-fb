import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Save, Database, Download, Play, Clock, Archive } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [config, setConfig] = useState({ interval_hours: 24, retention_count: 5 });
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true); // لودینگ پیش‌فرض روشن

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // استفاده از try-catch جداگانه برای جلوگیری از کرش کلی
      const resConfig = await api.get('/backup/config').catch(() => null);
      const resList = await api.get('/backup/list').catch(() => null);

      if (resConfig && resConfig.data && !resConfig.data.toString().includes('<!doctype')) {
          setConfig(resConfig.data);
      }
      
      if (resList && Array.isArray(resList.data)) {
          setBackups(resList.data);
      }
    } catch (err) { 
        console.error("Error fetching settings:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/backup/config', config);
      toast.success("تنظیمات ذخیره شد");
    } catch (err) { toast.error("خطا در ذخیره تنظیمات"); }
  };

  const handleBackupNow = async () => {
    const toastId = toast.loading("در حال بکاپ‌گیری...");
    try {
      await api.post('/backup/run');
      toast.update(toastId, { render: "بکاپ انجام شد ✅", type: "success", isLoading: false, autoClose: 3000 });
      fetchData(); 
    } catch (err) { 
        toast.update(toastId, { render: "خطا در بکاپ‌گیری", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const downloadFile = (filename) => {
    window.open(`http://localhost:9090/backup/download/${filename}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center text-gray-500">⏳ در حال دریافت تنظیمات...</div>;

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Database className="text-blue-600" size={32}/>
        <h1 className="text-2xl font-bold text-gray-800">تنظیمات و پشتیبان‌گیری</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* کارت تنظیمات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <Clock className="text-gray-400"/> تنظیمات بکاپ خودکار
            </h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">فاصله زمانی (ساعت)</label>
                    <select 
                        className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-gray-50"
                        value={config.interval_hours}
                        onChange={e => setConfig({...config, interval_hours: Number(e.target.value)})}
                    >
                        <option value="1">هر ۱ ساعت</option>
                        <option value="6">هر ۶ ساعت</option>
                        <option value="12">هر ۱۲ ساعت</option>
                        <option value="24">روزانه (هر ۲۴ ساعت)</option>
                        <option value="48">یک روز در میان</option>
                        <option value="168">هفتگی</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">تعداد نگهداری فایل‌ها</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 bg-gray-50"
                        value={config.retention_count}
                        onChange={e => setConfig({...config, retention_count: Number(e.target.value)})}
                        min="1" max="50"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={handleSaveConfig} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center gap-2">
                        <Save size={18}/> ذخیره
                    </button>
                    <button onClick={handleBackupNow} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex justify-center gap-2">
                        <Play size={18}/> بکاپ فوری
                    </button>
                </div>
            </div>
        </div>

        {/* لیست آرشیو */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <Archive className="text-gray-400"/> آرشیو فایل‌ها
            </h2>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {backups.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">هنوز بکاپی گرفته نشده است.</div>
                ) : backups.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition">
                        <div>
                            <p className="font-bold text-gray-800 text-sm dir-ltr">{file.name}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                <span>📅 {file.date}</span>
                                <span>💾 {file.size} MB</span>
                            </div>
                        </div>
                        <button onClick={() => downloadFile(file.name)} className="text-blue-600 bg-blue-100 p-2 rounded-lg hover:bg-blue-200 transition">
                            <Download size={20}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}