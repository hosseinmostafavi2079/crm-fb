import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MessageSquare, Play, Clock, List, Send, Filter, Trash2, Plus, Zap, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function SMS() {
  const [activeTab, setActiveTab] = useState('automation'); 
  const [loading, setLoading] = useState(false);
  
  // Data
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Forms
  const [ruleForm, setRuleForm] = useState({ title: '', days_before: 7, service_type: 'antivirus', template: '', is_active: true });
  
  // ویرایش قالب
  const [tempForm, setTempForm] = useState({ id: null, title: '', text: '' });
  const [isEditingTemp, setIsEditingTemp] = useState(false);
  
  // ارسال دستی (اصلاح شده: دو فیلد جدا)
  const [startDate, setStartDate] = useState(null); // تاریخ شروع
  const [endDate, setEndDate] = useState(null);     // تاریخ پایان
  const [manualService, setManualService] = useState('antivirus');
  const [previewList, setPreviewList] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState('');

  useEffect(() => {
    if(activeTab === 'templates' || activeTab === 'rules' || activeTab === 'automation' || activeTab === 'manual') fetchTemplates();
    if(activeTab === 'rules' || activeTab === 'automation') fetchRules();
    if(activeTab === 'history') fetchLogs();
  }, [activeTab]);

  const fetchTemplates = async () => { try { const res = await api.get('/api/sms/templates/'); setTemplates(res.data || []); } catch(e){} };
  const fetchRules = async () => { try { const res = await api.get('/api/sms/rules/'); setRules(res.data || []); } catch(e){} };
  const fetchLogs = async () => { try { const res = await api.get('/api/sms/history/'); setLogs(res.data || []); } catch(e){} };

  // --- Automation ---
  const handleRunAutomation = async () => {
      setLoading(true);
      try {
          const res = await api.post('/api/sms/rules/run_check/');
          toast.success(res.data.message);
      } catch(err) { toast.error("خطا در اجرا"); }
      finally { setLoading(false); }
  };

  // --- Rules ---
  const handleSaveRule = async () => {
      if(!ruleForm.title) return toast.error("عنوان الزامی است");
      try {
          await api.post('/api/sms/rules/', ruleForm);
          toast.success("قانون ذخیره شد");
          fetchRules();
          setRuleForm({ title: '', days_before: 7, service_type: 'antivirus', template: '', is_active: true });
      } catch(err) { toast.error("خطا"); }
  };
  const handleDeleteRule = async (id) => { if(confirm('حذف شود؟')) { await api.delete(`/api/sms/rules/${id}/`); fetchRules(); } };

  // --- Templates (Edit & Add) ---
  const handleSaveTemplate = async () => {
      if(!tempForm.title || !tempForm.text) return toast.error("عنوان و متن الزامی است");
      try { 
          if(isEditingTemp && tempForm.id) {
              await api.put(`/api/sms/templates/${tempForm.id}/`, tempForm);
              toast.success("قالب ویرایش شد");
          } else {
              await api.post('/api/sms/templates/', tempForm);
              toast.success("قالب جدید ساخته شد");
          }
          fetchTemplates(); 
          setTempForm({ id: null, title:'', text:'' });
          setIsEditingTemp(false);
      } catch(err) { toast.error("خطا"); }
  };

  const handleEditTemplate = (t) => {
      setTempForm({ id: t.id, title: t.title, text: t.text });
      setIsEditingTemp(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (id) => { if(confirm('حذف شود؟')) { await api.delete(`/api/sms/templates/${id}/`); fetchTemplates(); } };
  const handleCancelEdit = () => { setIsEditingTemp(false); setTempForm({ id: null, title:'', text:'' }); };

  // --- Manual Filter (Updated Logic) ---
  const handlePreview = async () => {
    // بررسی اینکه هر دو تاریخ انتخاب شده باشند
    if (!startDate || !endDate) {
        return toast.error("لطفا هر دو تاریخ (شروع و پایان) را انتخاب کنید");
    }

    setLoading(true);
    setPreviewList([]);
    try {
        const payload = { 
            service_type: manualService,
            start_date: startDate.toString(),
            end_date: endDate.toString()
        };
        const res = await api.post('/api/sms/history/preview_smart_send/', payload);
        setPreviewList(res.data);
        if(res.data.length === 0) toast.info("موردی یافت نشد");
    } catch(err) { toast.error("خطا در جستجو"); }
    finally { setLoading(false); }
  };

  const handleSendBulk = async () => {
      if(!selectedMsg) return toast.error("متن پیام را وارد کنید");
      if(previewList.length === 0) return toast.error("لیست خالی است");
      if(!confirm(`ارسال به ${previewList.length} نفر؟`)) return;

      setLoading(true);
      try {
          const ids = previewList.map(i => i.id);
          const res = await api.post('/api/sms/history/send_bulk/', { device_ids: ids, message: selectedMsg });
          toast.success(res.data.message);
          setPreviewList([]);
      } catch(err) { toast.error("خطا در ارسال"); }
      finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Menu */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b bg-white p-2 rounded-xl shadow-sm">
        <TabButton id="automation" label="داشبورد اتوماسیون" icon={<Zap/>} active={activeTab} set={setActiveTab}/>
        <TabButton id="rules" label="مدیریت قوانین" icon={<List/>} active={activeTab} set={setActiveTab}/>
        <TabButton id="templates" label="قالب‌های پیامک" icon={<MessageSquare/>} active={activeTab} set={setActiveTab}/>
        <TabButton id="manual" label="ارسال دستی (فیلتر)" icon={<Filter/>} active={activeTab} set={setActiveTab}/>
        <TabButton id="history" label="تاریخچه" icon={<Clock/>} active={activeTab} set={setActiveTab}/>
      </div>

      {/* 1. Automation */}
      {activeTab === 'automation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                  <div><h2 className="text-2xl font-bold mb-2">ارسال هوشمند خودکار</h2><p className="opacity-80">بررسی قوانین و ارسال پیامک به مشتریانی که موعد انقضایشان رسیده است.</p></div>
                  <button onClick={handleRunAutomation} disabled={loading} className="mt-8 bg-white text-blue-700 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-100 transition flex items-center justify-center gap-3">{loading ? '...' : 'اجرای قوانین'}</button>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border overflow-auto max-h-80">
                  <h3 className="font-bold text-gray-700 border-b pb-3 mb-4">قوانین فعال</h3>
                  <div className="space-y-3">
                      {rules.map(r => (
                          <div key={r.id} className="flex justify-between p-3 bg-gray-50 rounded-xl border"><span className="font-bold">{r.title}</span><span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{r.days_before} روز قبل</span></div>
                      ))}
                      {rules.length === 0 && <p className="text-gray-400 text-center">بدون قانون</p>}
                  </div>
              </div>
          </div>
      )}

      {/* 2. Rules */}
      {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
                  <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 flex gap-2"><Plus/> قانون جدید</h3>
                  <div className="space-y-4">
                      <input className="input-field w-full" placeholder="عنوان" value={ruleForm.title} onChange={e=>setRuleForm({...ruleForm, title:e.target.value})}/>
                      <div className="flex gap-2 items-center"><input type="number" className="input-field w-20 text-center" value={ruleForm.days_before} onChange={e=>setRuleForm({...ruleForm, days_before:e.target.value})}/><span className="text-sm">روز قبل از انقضا</span></div>
                      <select className="input-field w-full" value={ruleForm.service_type} onChange={e=>setRuleForm({...ruleForm, service_type:e.target.value})}><option value="antivirus">آنتی‌ویروس</option><option value="warranty">گارانتی</option></select>
                      <select className="input-field w-full" value={ruleForm.template} onChange={e=>setRuleForm({...ruleForm, template:e.target.value})}><option value="">-- قالب --</option>{templates.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select>
                      <button onClick={handleSaveRule} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">ذخیره</button>
                  </div>
              </div>
              <div className="lg:col-span-2 space-y-3">
                  {rules.map(r => (
                      <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                          <div><div className="font-bold">{r.title}</div><div className="text-sm text-gray-500">{r.days_before} روز قبل از {r.service_type}</div></div>
                          <button onClick={()=>handleDeleteRule(r.id)} className="text-red-400 p-2"><Trash2/></button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 3. Templates */}
      {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
                  <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 flex justify-between">
                      <span>{isEditingTemp ? 'ویرایش قالب' : 'افزودن قالب'}</span>
                      {isEditingTemp && <button onClick={handleCancelEdit} className="text-xs text-red-500 bg-red-50 px-2 rounded">لغو</button>}
                  </h3>
                  <div className="space-y-4">
                      <input className="input-field w-full" placeholder="عنوان" value={tempForm.title} onChange={e=>setTempForm({...tempForm, title:e.target.value})}/>
                      <textarea className="input-field w-full h-32" placeholder="متن..." value={tempForm.text} onChange={e=>setTempForm({...tempForm, text:e.target.value})}/>
                      <button onClick={handleSaveTemplate} className={`w-full text-white py-3 rounded-xl font-bold ${isEditingTemp?'bg-orange-500 hover:bg-orange-600':'bg-green-600 hover:bg-green-700'}`}>
                          {isEditingTemp ? 'بروزرسانی قالب' : 'ذخیره قالب'}
                      </button>
                  </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(t => (
                      <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border relative group">
                          <h4 className="font-bold text-gray-800 mb-2">{t.title}</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{t.text}</p>
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={()=>handleEditTemplate(t)} className="text-orange-400 hover:text-orange-600 bg-white p-1 rounded-lg shadow-sm border"><Edit2 size={16}/></button>
                              <button onClick={()=>handleDeleteTemplate(t.id)} className="text-red-400 hover:text-red-600 bg-white p-1 rounded-lg shadow-sm border"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 4. Manual Send (Two Separate Fields) */}
      {activeTab === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                      <h3 className="font-bold text-gray-700 border-b pb-3">فیلتر زمانی</h3>
                      <select className="input-field w-full" value={manualService} onChange={e=>setManualService(e.target.value)}>
                          <option value="antivirus">آنتی‌ویروس</option>
                          <option value="warranty">گارانتی</option>
                      </select>
                      
                      {/* فیلدهای تاریخ جداگانه */}
                      <div className="flex gap-2">
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">از تاریخ</label>
                              <DatePicker 
                                value={startDate} 
                                onChange={setStartDate} 
                                calendar={persian} 
                                locale={persian_fa} 
                                inputClass="input-field w-full text-center py-2 font-mono text-sm" 
                                placeholder="شروع"
                              />
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">تا تاریخ</label>
                              <DatePicker 
                                value={endDate} 
                                onChange={setEndDate} 
                                calendar={persian} 
                                locale={persian_fa} 
                                inputClass="input-field w-full text-center py-2 font-mono text-sm" 
                                placeholder="پایان"
                              />
                          </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 mt-1 bg-yellow-50 p-2 rounded">
                          نکته: برای پیدا کردن منقضی شده‌های سال گذشته، تاریخ‌ها را در سال‌های قبل انتخاب کنید.
                      </p>

                      <button onClick={handlePreview} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
                          {loading ? '...' : 'جستجو و نمایش'}
                      </button>
                  </div>

                  {previewList.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 animate-fade-in">
                          <h3 className="font-bold text-gray-700 border-b pb-3">ارسال پیام</h3>
                          <select className="input-field w-full" onChange={e => {
                              const t = templates.find(t => t.id == e.target.value);
                              if(t) setSelectedMsg(t.text);
                          }}>
                              <option value="">-- انتخاب قالب --</option>
                              {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </select>
                          <textarea className="input-field w-full h-32" placeholder="متن پیام..." value={selectedMsg} onChange={e=>setSelectedMsg(e.target.value)}></textarea>
                          <button onClick={handleSendBulk} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex justify-center gap-2">
                              <Send size={20}/> ارسال پیامک
                          </button>
                      </div>
                  )}
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex justify-between items-center">
                      <span>نتایج جستجو ({previewList.length})</span>
                      {previewList.length > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">آماده ارسال</span>}
                  </div>
                  <div className="overflow-auto max-h-[600px]">
                      <table className="w-full text-right text-sm">
                          <thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th className="p-4">مشتری</th><th className="p-4">دستگاه</th><th className="p-4">انقضا</th></tr></thead>
                          <tbody>
                              {previewList.map(item => (
                                  <tr key={item.id} className="border-b hover:bg-gray-50">
                                      <td className="p-4 font-bold">{item.customer}<div className="text-xs font-mono text-gray-400">{item.phone}</div></td>
                                      <td className="p-4">{item.device}</td>
                                      <td className="p-4 text-red-600 font-bold font-mono">{item.expiry_date}</td>
                                  </tr>
                              ))}
                              {previewList.length === 0 && <tr><td colSpan="3" className="p-10 text-center text-gray-400">لیست خالی است</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* 5. History */}
      {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">زمان</th><th className="p-4">گیرنده</th><th className="p-4">متن</th><th className="p-4">وضعیت</th></tr></thead>
                  <tbody>
                      {logs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 border-b">
                              <td className="p-4 font-mono text-gray-500">{log.jalali_sent_at}</td>
                              <td className="p-4 font-bold">{log.recipient_phone}<div className="text-xs text-gray-400">{log.device_info}</div></td>
                              <td className="p-4 max-w-md truncate" title={log.message_body}>{log.message_body}</td>
                              <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">ارسال شد</span></td>
                          </tr>
                      ))}
                      {logs.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-gray-400">تاریخچه خالی است</td></tr>}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
}

const TabButton = ({ id, label, icon, active, set }) => (
    <button onClick={()=>set(id)} className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold whitespace-nowrap transition ${active===id?'bg-blue-600 text-white shadow-md':'bg-white text-gray-600 hover:bg-gray-50'}`}>
        {icon} {label}
    </button>
);