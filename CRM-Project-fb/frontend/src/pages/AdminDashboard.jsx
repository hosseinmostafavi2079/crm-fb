import { useEffect, useState } from 'react';
import api from '../api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // API Call
    api.get('/api/dashboard/stats/').then(res => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return (
      <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
  );

  const cards = [
    { title: 'کل مشتریان', val: stats.total_customers, sub: '+۱۲٪ ماه اخیر', color: 'from-blue-500 to-blue-600', icon: <Users className="text-white opacity-80" size={28}/> },
    { title: 'سرویس‌های فعال', val: stats.total_invoices, sub: 'وضعیت نرمال', color: 'from-emerald-500 to-emerald-600', icon: <ShieldCheck className="text-white opacity-80" size={28}/> },
    { title: 'نزدیک به انقضا', val: stats.warning_antivirus, sub: 'نیاز به پیگیری', color: 'from-amber-400 to-amber-500', icon: <Clock className="text-white opacity-80" size={28}/> },
    { title: 'منقضی شده', val: stats.expired_antivirus, sub: 'اقدام فوری', color: 'from-rose-500 to-rose-600', icon: <AlertTriangle className="text-white opacity-80" size={28}/> },
  ];

  const chartData = [
    { name: 'سالم', value: stats.total_customers - (stats.expired_antivirus + stats.warning_antivirus), color: '#10b981' },
    { name: 'هشدار', value: stats.warning_antivirus, color: '#f59e0b' },
    { name: 'منقضی', value: stats.expired_antivirus, color: '#ef4444' },
  ];
  
  // دیتای فیک برای نمودار خطی (چون فعلا API تاریخچه نداریم)
  const activityData = [
      { name: 'ش', sales: 4000 }, { name: 'ی', sales: 3000 }, { name: 'د', sales: 5000 },
      { name: 'س', sales: 2780 }, { name: 'چ', sales: 1890 }, { name: 'پ', sales: 6390 }, { name: 'ج', sales: 3490 },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
          <div>
              <h1 className="text-2xl font-bold text-gray-800">بررسی اجمالی</h1>
              <p className="text-gray-500 mt-1 text-sm">گزارش وضعیت سیستم در یک نگاه</p>
          </div>
          <button className="bg-white border text-gray-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition">
              دریافت گزارش PDF
          </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, idx) => (
          <div key={idx} className={`relative overflow-hidden rounded-3xl p-6 shadow-xl shadow-gray-200 bg-gradient-to-br ${c.color} text-white transition-transform hover:-translate-y-1`}>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">{c.title}</p>
                    <h3 className="text-3xl font-extrabold">{c.val}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">{c.icon}</div>
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-1 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-md">
                <TrendingUp size={14}/> {c.sub}
            </div>
            {/* Decorative Circles */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/5 rounded-full blur-xl"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* نمودار اصلی (چپ) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-indigo-600"/> روند فروش هفته
            </h3>
            <div className="h-72 w-full dir-ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}}/>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* نمودار دایره‌ای (راست) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
            <h3 className="font-bold text-gray-800 w-full mb-2">سلامت لایسنس‌ها</h3>
            <div className="h-64 w-full dir-ltr relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                            {chartData.map((entry, index) => <Cell key={index} fill={entry.color} cornerRadius={10}/>)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                {/* متن وسط دونات */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-gray-800">{stats.total_customers}</span>
                    <span className="text-xs text-gray-400">کل سرویس‌ها</span>
                </div>
            </div>
            {/* لجند */}
            <div className="w-full space-y-2 mt-2">
                {chartData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                            {item.name}
                        </span>
                        <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}