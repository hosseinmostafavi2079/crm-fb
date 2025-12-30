import { useEffect, useState } from 'react';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, ShieldCheck, AlertTriangle, XCircle, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard-stats');
        console.log("Stats received:", res.data); // برای دیباگ
        if (res.data) {
            setStats(res.data);
        }
      } catch (error) {
        console.error("Error loading stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 1. نمایش لودینگ تا زمانی که دیتا بیاید
  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 font-bold">⏳ در حال دریافت آمار...</div>;

  // 2. جلوگیری از کرش اگر دیتا نرسید
  const safeStats = stats || {};
  const safeCount = safeStats.safe || 0;
  const warningCount = safeStats.warning || 0;
  const expiredCount = safeStats.expired || 0;
  const totalCust = safeStats.total_customers || 0;
  const totalActive = safeStats.total_active || 0;

  // 3. ساخت داده‌های نمودار (همیشه آرایه باشد)
  const pieData = [
    { name: 'ایمن', value: safeCount, color: '#10b981' }, 
    { name: 'هشدار', value: warningCount, color: '#f59e0b' }, 
    { name: 'منقضی', value: expiredCount, color: '#ef4444' }, 
  ];

  const barData = [
    { name: 'کل مشتریان', count: totalCust },
    { name: 'سرویس‌دار', count: totalActive },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 border-r-4 border-blue-600 pr-4">داشبورد وضعیت کلی</h1>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">وضعیت: آنلاین</span>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="کل مشتریان" value={totalCust} icon={<Users />} color="bg-blue-500" />
        <StatCard title="سرویس‌های فعال" value={totalActive} icon={<Activity />} color="bg-indigo-500" />
        <StatCard title="در شرف انقضا" value={warningCount} icon={<AlertTriangle />} color="bg-yellow-500" />
        <StatCard title="منقضی شده" value={expiredCount} icon={<XCircle />} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* نمودار دایره‌ای */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-green-600" size={20}/> وضعیت سلامت سرویس‌ها
          </h3>
          
          {/* ارتفاع ثابت با استایل مستقیم (حیاتی برای جلوگیری از خطا) */}
          <div style={{ width: '100%', height: '350px', direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* نمودار میله‌ای */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Activity className="text-blue-600" size={20}/> پوشش خدمات
          </h3>
          
           {/* ارتفاع ثابت با استایل مستقیم (حیاتی برای جلوگیری از خطا) */}
          <div style={{ width: '100%', height: '350px', direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
        {icon}
      </div>
    </div>
  );
}