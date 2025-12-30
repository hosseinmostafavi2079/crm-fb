import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // اگر توکن نبود، برو به صفحه لاگین
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // اگر کاربر می‌خواهد جای ممنوعه برود (مثلا مشتری به پنل ادمین)
    if (role && role !== userRole) {
        // هدایت به پنل مخصوص خودش
        return <Navigate to={userRole === 'admin' ? '/admin' : '/portal'} replace />;
    }

    return children;
};

export default PrivateRoute;