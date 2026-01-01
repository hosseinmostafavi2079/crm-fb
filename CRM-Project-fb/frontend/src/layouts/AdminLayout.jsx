import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, MessageSquare, Bell, FileText, LogOut, Settings 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem('name') || 'مدیر';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', title: 'داشبورد و آمار', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/customers', title: 'مدیریت مشتریان', icon: <Users size={20} /> },
    
    // --- تغییر نام به "ارسال پیامک" ---
    { path: '/admin/sms', title: 'ارسال پیامک', icon: <MessageSquare size={20} /> },
    
    { path: '/admin/logs', title: 'گزارشات سیستم', icon: <FileText size={20} /> },
    { path: '/admin/settings', title: 'تنظیمات', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
              A
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">پنل مدیریت</h2>
              <p className="text-xs text-gray-500 mt-1">{adminName}</p>
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
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}