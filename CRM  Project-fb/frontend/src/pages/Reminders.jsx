import { BellRing, Calendar, CheckCircle } from 'lucide-react';

export default function Reminders() {
  // دیتای تستی برای نمایش
  const reminders = [
    { id: 1, title: 'تماس با شرکت آلفا', date: '1403/10/12', type: 'call' },
    { id: 2, title: 'تمدید سرور پشتیبان', date: '1403/10/15', type: 'renew' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><BellRing size={24}/></div>
        <h1 className="text-2xl font-bold text-gray-800">یادآوری‌های سیستم</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map(rem => (
          <div key={rem.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{rem.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-mono bg-gray-50 w-fit px-2 py-1 rounded">
                <Calendar size={12}/> {rem.date}
              </div>
            </div>
            <button className="text-gray-300 hover:text-green-500 transition">
              <CheckCircle size={20}/>
            </button>
          </div>
        ))}
        
        {/* کارت افزودن */}
        <button className="border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition h-32">
           <span className="text-3xl font-light">+</span>
           <span className="text-sm font-bold">یادآوری جدید</span>
        </button>
      </div>
    </div>
  );
}