from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# روتر اتوماتیک برای ViewSet ها
router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'products', ProductViewSet)
router.register(r'config', ConfigViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats),
    path('auth/me/', me),
]