import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    // --- تغییر مهم: هماهنگ‌سازی نام‌ها با فایل Login.jsx ---
    const token = localStorage.getItem('access_token'); // قبلا token بود که غلط بود
    const userRole = localStorage.getItem('role');

    // اگر توکن وجود ندارد (کاربر لاگین نیست)
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // اگر کاربر لاگین است اما نقش او با نقش مورد نظر صفحه (مثلا admin) یکی نیست
    if (role && role !== userRole) {
        // اگر ادمین است برود به ادمین، اگر نه برود به پرتال
        return <Navigate to={userRole === 'admin' ? '/admin' : '/portal'} replace />;
    }

    return children;
};

export default PrivateRoute;