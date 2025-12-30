import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// صفحات لاگین
import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import AdminLogin from './pages/AdminLogin';

// صفحات پنل‌ها
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerPortal from './pages/CustomerPortal';
import PrivateRoute from './components/PrivateRoute';

// صفحات داخلی ادمین
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Orders from './pages/Orders';
import Products from './pages/Products';
import SMS from './pages/SMS';
import Reminders from './pages/Reminders';
import Logs from './pages/Logs';
import Settings from './pages/Settings'; // اضافه شده

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" rtl />

      <Routes>
        {/* --- بخش عمومی --- */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* --- پنل ادمین --- */}
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="add-customer" element={<AddCustomer />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="sms" element={<SMS />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="logs" element={<Logs />} />
            {/* مسیر جدید تنظیمات */}
            <Route path="settings" element={<Settings />} />
        </Route>

        {/* --- پنل مشتری --- */}
        <Route path="/portal" element={
          <PrivateRoute role="customer">
            <CustomerPortal />
          </PrivateRoute>
        } />

        {/* مسیرهای اشتباه */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;