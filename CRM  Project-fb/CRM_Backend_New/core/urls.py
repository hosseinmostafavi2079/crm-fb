from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, 
    ProductViewSet, 
    InvoiceViewSet, 
    ConfigViewSet, 
    LogViewSet, 
    dashboard_stats
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# تعریف روتر برای ویوست‌ها
router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'products', ProductViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'config', ConfigViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    # مسیرهای اصلی API
    path('', include(router.urls)),
    
    # آمار داشبورد
    path('dashboard/stats/', dashboard_stats),
    
    # مسیرهای لاگین و توکن
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]