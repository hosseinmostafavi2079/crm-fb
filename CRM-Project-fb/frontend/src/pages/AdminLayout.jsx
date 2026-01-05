import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, LogOut, 
  Settings, Bell, Search, Menu, X, ChevronRight, ChevronLeft, MessageSquare, BellRing, Shield 
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // وضعیت جمع شدن سایدبار
  const adminName = localStorage.getItem('user_name') || 'مدیر سیستم';

  const handleLogout = () => {
    if(confirm("آیا قصد خروج از حساب کاربری را دارید؟")) {
        localStorage.clear();
        navigate('/login');
    }
  };

  const menu = [
    { path: '/admin', label: 'داشبورد', icon: <LayoutDashboard size={22}/> },
    { path: '/admin/customers', label: 'مشتریان', icon: <Users size={22}/> },
    { path: '/admin/orders', label: 'سفارشات', icon: <ShoppingCart size={22}/> },
    { path: '/admin/products', label: 'محصولات', icon: <Package size={22}/> },
    { path: '/admin/sms', label: 'پنل پیامک', icon: <MessageSquare size={22}/> },
    { path: '/admin/reminders', label: 'یادآوری‌ها', icon: <BellRing size={22}/> },
    { path: '/admin/logs', label: 'گزارشات', icon: <Shield size={22}/> },
    { path: '/admin/settings', label: 'تنظیمات', icon: <Settings size={22}/> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden" dir="rtl">
      
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden lg:flex flex-col bg-slate-900 h-full z-30 transition-all duration-300 shadow-2xl
        ${collapsed ? 'w-24' : 'w-72'} fixed right-0 top-0`}
      >
        {/* Header Sidebar */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <span className="font-bold text-xl">C</span>
             </div>
             {!collapsed && (
               <div className="whitespace-nowrap overflow-hidden transition-all duration-300">
                 <h1 className="font-bold text-lg text-white tracking-wide">CRM Pro</h1>
                 <p className="text-[10px] text-slate-400">نسخه ۳.۲.۰</p>
               </div>
             )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
                <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ''}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative
                    ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                `}
                >
                <div className="flex-shrink-0">{item.icon}</div>
                
                {!collapsed && (
                  <span className="text-sm whitespace-nowrap overflow-hidden transition-all duration-300">{item.label}</span>
                )}
                
                {isActive && !collapsed && <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                </NavLink>
            )
          })}
        </nav>

        {/* Footer Sidebar (Collapse Button) */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden lg:flex items-center justify-center w-full p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition mb-2"
          >
            {collapsed ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
          </button>
          
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition font-medium text-sm ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={20}/> {!collapsed && <span>خروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:mr-24' : 'lg:mr-72'}`}>
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-4">
             <button className="lg:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24}/>
             </button>
             <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
                {menu.find(m => m.path === location.pathname)?.label || 'داشبورد'}
             </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
             <div className="relative hidden md:block">
                <Search className="absolute right-3 top-2.5 text-gray-400" size={18}/>
                <input type="text" placeholder="جستجو..." className="pl-4 pr-10 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm w-48 lg:w-64 transition-all"/>
             </div>
             
             <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="text-left hidden md:block">
                   <p className="text-sm font-bold text-gray-800">{adminName}</p>
                   <p className="text-xs text-gray-500">مدیر کل</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                   {adminName.charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* Page Content Scrollable */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
           <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="absolute right-0 top-0 h-full w-72 bg-slate-900 p-6 shadow-2xl transform transition-transform duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-8 text-white border-b border-slate-800 pb-4">
                    <span className="font-bold text-xl">منو اصلی</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                <nav className="space-y-2">
                  {menu.map(item => (
                      <NavLink 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({isActive}) => `flex items-center gap-4 p-3 rounded-xl transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                          {item.icon} {item.label}
                      </NavLink>
                  ))}
                </nav>
            </div>
        </div>
      )}
    </div>
  );
}