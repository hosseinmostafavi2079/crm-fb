import logo from '../assets/logo.png';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, ShoppingBag, 
  MessageSquare, Bell, FileText, ShieldAlert, LogOut, PlusCircle, Settings 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', title: 'داشبورد و آمار', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/customers', title: 'مدیریت مشتریان', icon: <Users size={20} /> },
    { path: '/admin/add-customer', title: 'ثبت دستی مشتری', icon: <PlusCircle size={20} /> },
    { path: '/admin/orders', title: 'مدیریت سفارشات', icon: <FileText size={20} /> },
    { path: '/admin/products', title: 'محصولات و قیمت', icon: <ShoppingBag size={20} /> },
    { path: '/admin/sms', title: 'پنل پیامک', icon: <MessageSquare size={20} /> },
    { path: '/admin/reminders', title: 'یادآوری‌ها', icon: <Bell size={20} /> },
    { path: '/admin/logs', title: 'گزارشات امنیتی', icon: <ShieldAlert size={20} /> },
    { path: '/admin/settings', title: 'تنظیمات و بکاپ', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans" dir="rtl">
      {/* سایدبار ثابت */}
      <aside className="w-72 bg-white shadow-xl hidden md:flex flex-col border-l border-gray-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm p-1">
               {/* هندل کردن لود نشدن لوگو برای جلوگیری از کرش */}
               {logo && <img src={logo} alt="CRM" className="w-full h-full object-contain" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">پنل مدیریت</h2>
              <p className="text-xs text-gray-500 mt-1">مدیر: {adminName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl w-full transition font-bold text-sm">
            <LogOut size={18} /> خروج از سیستم
          </button>
        </div>
      </aside>

      {/* محتوای صفحه */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}