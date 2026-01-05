import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Customers from './pages/Customers';
// import AddCustomer from './pages/AddCustomer'; <--- قبلا حذف شده بود
import SMS from './pages/SMS';
// import Reminders from './pages/Reminders'; <--- این خط حذف شد (منبع خطا)
import Logs from './pages/Logs';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-center" rtl theme="colored" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          
          {/* <Route path="add-customer" element={<AddCustomer />} /> */}
          
          <Route path="sms" element={<SMS />} />
          {/* <Route path="reminders" element={<Reminders />} /> <--- این خط حذف شد */}
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}