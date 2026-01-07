from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, ConfigViewSet, LogViewSet, 
    SMSTemplateViewSet, NotificationRuleViewSet, SMSLogViewSet,
    dashboard_stats
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'config', ConfigViewSet)
router.register(r'logs', LogViewSet)
# --- مسیرهای جدید ---
router.register(r'sms/templates', SMSTemplateViewSet)
router.register(r'sms/rules', NotificationRuleViewSet)
router.register(r'sms/history', SMSLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]