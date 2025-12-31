import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Components
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-center" rtl theme="colored" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* مسیرهای محافظت شده ادمین */}
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          {/* بقیه صفحات را بعدا اضافه کنید */}
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}