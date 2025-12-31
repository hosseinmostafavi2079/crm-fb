import { useState } from 'react';
import { MessageSquare, Send, History } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SMS() {
  const [activeTab, setActiveTab] = useState('send');
  const [message, setMessage] = useState('');
  const [receiver, setReceiver] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if(!receiver || !message) return toast.error('لطفا شماره و متن را وارد کنید');
    // اینجا بعدا API واقعی را وصل می‌کنیم
    toast.success('پیامک در صف ارسال قرار گرفت');
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><MessageSquare size={24}/></div>
        <h1 className="text-2xl font-bold text-gray-800">مدیریت پیامک‌ها</h1>
      </div>

      <div className="flex gap-4 border-b">
        <button onClick={()=>setActiveTab('send')} className={`pb-2 px-4 font-bold transition ${activeTab==='send' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>ارسال جدید</button>
        <button onClick={()=>setActiveTab('logs')} className={`pb-2 px-4 font-bold transition ${activeTab==='logs' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>تاریخچه ارسال</button>
      </div>

      {activeTab === 'send' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">شماره گیرنده</label>
              <input 
                type="tel" 
                placeholder="0912..." 
                className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 transition outline-none font-mono text-left"
                value={receiver}
                onChange={e => setReceiver(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">متن پیام</label>
              <textarea 
                rows="4"
                placeholder="متن پیامک خود را بنویسید..." 
                className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-purple-500 transition outline-none resize-none"
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
              <div className="text-left text-xs text-gray-400 mt-1">{message.length} کاراکتر</div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-200">
               <Send size={18}/> ارسال پیامک
            </button>
          </form>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
             <History size={48} className="opacity-20"/>
             <p>تاریخچه‌ای یافت نشد</p>
          </div>
        </div>
      )}
    </div>
  );
}