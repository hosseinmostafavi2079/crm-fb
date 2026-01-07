import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Settings as Icon, Save, Shield, Download, FileText, MessageSquare, Database, Clock, RefreshCw, Trash2, HardDrive } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [config, setConfig] = useState({ 
    sms_provider: '',
    sms_api_key: '', 
    sms_line_number: '',
    backup_frequency: 'daily',
    backup_retention_count: 5
  });
  const [logs, setLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const configRes = await api.get('/api/config/');
        if(configRes.data.length > 0) setConfig(configRes.data[0]);

        const logsRes = await api.get('/api/logs/');
        setLogs(logsRes.data);
        
        fetchBackups();
    } catch (e) {
        console.error(e);
    }
  };

  const fetchBackups = async () => {
      try {
          const res = await api.get('/api/config/list_backups/');
          setBackups(res.data);
      } catch(e) {}
  }

  const handleSaveConfig = async () => {
      try {
          if(config.id) {
              await api.put(`/api/config/${config.id}/`, config);
          } else {
              await api.post('/api/config/', config);
          }
          toast.success("تنظیمات ذخیره شد");
      } catch(e) { toast.error("خطا در ذخیره"); }
  };

  const handleCreateBackup = async () => {
      setLoadingBackup(true);
      try {
          await api.post('/api/config/trigger_backup/');
          toast.success("بکاپ کامل ایجاد شد");
          fetchBackups();
      } catch(e) {
          toast.error("خطا در ایجاد بکاپ");
      } finally {
          setLoadingBackup(false);
      }
  };

    const handleRestoreBackup = async (filename) => {
      if(!window.confirm(`هشدار جدی: \nآیا مطمئن هستید که می‌خواهید فایل ${filename} را بازگردانی کنید؟\n\nبا این کار تمام اطلاعات فعلی مشتریان و دستگاه‌ها حذف شده و اطلاعات فایل بکاپ جایگزین می‌شود.`)) return;

      setRestoring(true);
      try {
          const res = await api.post('/api/config/restore_backup/', { filename });
          toast.success(res.data.message);
          
          // ریلود صفحه برای نمایش اطلاعات جدید
          setTimeout(() => window.location.reload(), 2000);
      } catch(e) {
          console.error(e);
          // نمایش متن دقیق خطا که از سرور آمده
          const serverError = e.response?.data?.error || "خطای ناشناخته در سرور";
          toast.error(serverError);
      } finally {
          setRestoring(false);
      }
  };

  const handleDownloadBackup = async (filename) => {
      try {
          const name = filename.replace('.json', '');
          const response = await api.get(`/api/config/download_backup/${name}/`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch(e) { toast.error("دانلود ناموفق"); }
  };

  const handleExportExcel = async () => {
      try {
          const response = await api.get('/api/logs/export_excel/', { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'system_logs.xlsx');
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch(e) { toast.error("خطا"); }
  };

  const tabs = [
    { id: 'general', label: 'بکاپ و عمومی', icon: <Database size={18}/> },
    { id: 'sms', label: 'تنظیمات پیامک', icon: <MessageSquare size={18}/> },
    { id: 'logs', label: 'گزارشات و امنیت', icon: <Shield size={18}/> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <div className="flex items-center gap-2 mb-4 border-b pb-4">
         <Icon className="text-gray-600"/> <h1 className="text-2xl font-bold">مدیریت سیستم</h1>
       </div>

       <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
           {tabs.map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition whitespace-nowrap ${
                 activeTab === tab.id 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                   : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
               }`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
       </div>
       
       {activeTab === 'general' && (
           <div className="grid md:grid-cols-2 gap-6 animation-fade-in">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                   <h3 className="text-lg font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                       <Clock size={18}/> تنظیمات زمان‌بندی بکاپ
                   </h3>
                   
                   <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">دوره‌ی بکاپ‌گیری خودکار</label>
                       <select 
                         className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 ring-blue-200"
                         value={config.backup_frequency}
                         onChange={e => setConfig({...config, backup_frequency: e.target.value})}
                       >
                           <option value="manual">غیرفعال (فقط دستی)</option>
                           <option value="hourly">ساعتی</option>
                           <option value="daily">روزانه</option>
                           <option value="weekly">هفتگی</option>
                           <option value="monthly">ماهانه</option>
                       </select>
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">تعداد نگهداری فایل بکاپ</label>
                       <input 
                         type="number" 
                         min="1" max="20"
                         className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 ring-blue-200"
                         value={config.backup_retention_count}
                         onChange={e => setConfig({...config, backup_retention_count: parseInt(e.target.value)})} 
                       />
                       <p className="text-xs text-gray-400 mt-2">سیستم همیشه {config.backup_retention_count} بکاپ آخر را نگه می‌دارد و قدیمی‌ها را پاک می‌کند.</p>
                   </div>

                   <button onClick={handleSaveConfig} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                       <Save size={18} className="inline ml-2"/> ذخیره تنظیمات
                   </button>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                   <div className="flex justify-between items-center border-b pb-2 mb-4">
                       <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2"><HardDrive size={18}/> فایل‌های بکاپ</h3>
                       <button 
                         onClick={handleCreateBackup} 
                         disabled={loadingBackup}
                         className={`text-xs px-3 py-2 rounded-lg font-bold transition flex items-center gap-1 ${loadingBackup ? 'bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                       >
                           {loadingBackup ? 'در حال ساخت...' : <><Database size={14}/> بکاپ جدید</>}
                       </button>
                   </div>

                   <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
                       {backups.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition group">
                               <div>
                                   <div className="font-bold text-sm text-gray-700 dir-ltr">{file.name}</div>
                                   <div className="text-xs text-gray-400 mt-1">{file.created} - {file.size}</div>
                               </div>
                               <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => handleRestoreBackup(file.name)} 
                                     disabled={restoring}
                                     className="text-orange-600 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition"
                                     title="بازگردانی این بکاپ"
                                   >
                                       <RefreshCw size={18} className={restoring ? "animate-spin" : ""}/>
                                   </button>
                                   <button 
                                     onClick={() => handleDownloadBackup(file.name)} 
                                     className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                                     title="دانلود فایل"
                                   >
                                       <Download size={18}/>
                                   </button>
                               </div>
                           </div>
                       ))}
                       {backups.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">هیچ فایل بکاپی موجود نیست</p>}
                   </div>
               </div>
           </div>
       )}

       {activeTab === 'sms' && (
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 animation-fade-in">
               <h3 className="text-lg font-bold text-gray-700 border-b pb-2">پیکربندی پنل پیامک</h3>
               
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت / پنل پیامکی</label>
                     <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 ring-blue-200" value={config.sms_provider} onChange={e=>setConfig({...config, sms_provider: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">شماره خط فرستنده</label>
                     <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 outline-none dir-ltr text-left font-mono focus:ring-2 ring-blue-200" value={config.sms_line_number} onChange={e=>setConfig({...config, sms_line_number: e.target.value})} />
                 </div>
               </div>

               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">کلید API (API Key)</label>
                   <input type="text" className="w-full p-3 border rounded-xl bg-gray-50 outline-none dir-ltr text-left font-mono focus:ring-2 ring-blue-200" value={config.sms_api_key} onChange={e=>setConfig({...config, sms_api_key: e.target.value})} />
               </div>

               <div className="flex justify-end pt-4">
                 <button onClick={handleSaveConfig} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md">
                     <Save size={18}/> ذخیره تنظیمات پیامک
                 </button>
               </div>
           </div>
       )}

       {activeTab === 'logs' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animation-fade-in">
               <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                   <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={18}/> لاگ‌های سیستم</h3>
                   <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-100">
                       <Download size={16}/> خروجی اکسل
                   </button>
               </div>
               
               <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                   <table className="w-full text-right text-sm">
                       <thead className="bg-gray-50 text-gray-500 sticky top-0">
                           <tr><th className="p-4">کاربر</th><th className="p-4">عملیات</th><th className="p-4">زمان</th></tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                           {logs.map((log, i) => (
                               <tr key={i} className="hover:bg-blue-50 transition-colors">
                                   <td className="p-4 font-bold text-gray-800">{log.username || 'System'}</td>
                                   <td className="p-4 text-gray-600">{log.action} <span className="text-gray-400 text-xs mr-2">{log.details}</span></td>
                                   <td className="p-4 dir-ltr text-gray-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString('fa-IR')}</td>
                               </tr>
                           ))}
                           {logs.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400">گزارشی ثبت نشده است</td></tr>}
                       </tbody>
                   </table>
               </div>
           </div>
       )}
    </div>
  );
}