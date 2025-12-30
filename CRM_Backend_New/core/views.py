from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.utils import timezone
import pandas as pd
import jdatetime
import io

from .models import User, Customer, Product, Invoice, SystemConfig, AuditLog
from .serializers import *

# --- 1. مدیریت مشتریان ---
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone', 'serial', 'device']

    # اکشن اختصاصی برای ایمپورت اکسل
    @action(detail=False, methods=['post'])
    def import_excel(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "File is required"}, status=400)
        
        try:
            # خواندن فایل اکسل با پانداز
            df = pd.read_excel(file)
            count = 0
            
            for _, row in df.iterrows():
                phone = str(row.get('Phone', row.get('موبایل', ''))).split('.')[0].strip()
                if len(phone) < 5: continue
                
                # اگر مشتری با این شماره نباشد، می‌سازیم
                customer, created = Customer.objects.get_or_create(
                    phone=phone,
                    defaults={
                        'name': row.get('Name', row.get('نام', 'بدون نام')),
                        'device': row.get('Device', '-'),
                        'model': row.get('Model', '-'),
                        'serial': row.get('Serial', '-'),
                        'notes': row.get('Notes', '-'),
                        'antivirus_name': row.get('Antivirus', '-')
                    }
                )
                if created: count += 1
            
            return Response({"status": "success", "imported": count})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # اکشن برای حذف همه (فقط ادمین)
    @action(detail=False, methods=['delete'], permission_classes=[IsAdminUser])
    def delete_all(self, request):
        count = Customer.objects.all().count()
        Customer.objects.all().delete()
        return Response({"status": "deleted", "count": count})

# --- 2. مدیریت فاکتورها ---
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer__name', 'customer__phone', 'status']

    # منطق هوشمند: وقتی فاکتور ساخته شد، اگر تمدید بود، تاریخ مشتری آپدیت شود
    def perform_create(self, serializer):
        invoice = serializer.save()
        service_name = invoice.service_name.lower()
        
        # چک کردن کلمات کلیدی برای تمدید آنتی ویروس
        if any(keyword in service_name for keyword in ['تمدید', 'antivirus', 'nod', 'license']):
            customer = invoice.customer
            # تمدید برای یک سال آینده
            customer.antivirus_expiry = timezone.now().date() + timezone.timedelta(days=365)
            customer.save()

# --- 3. مدیریت محصولات ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

# --- 4. تنظیمات و لاگ‌ها ---
class ConfigViewSet(viewsets.ModelViewSet):
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAdminUser]

class LogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

# --- 5. آمار داشبورد (API دستی) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_customers = Customer.objects.count()
    
    # محاسبه منقضی شده‌ها
    today = timezone.now().date()
    expired = Customer.objects.filter(antivirus_expiry__lt=today).count()
    warning = Customer.objects.filter(
        antivirus_expiry__gte=today,
        antivirus_expiry__lt=today + timezone.timedelta(days=30)
    ).count()
    
    return Response({
        "total_customers": total_customers,
        "expired_antivirus": expired,
        "warning_antivirus": warning,
        "total_invoices": Invoice.objects.count(),
        "today_sales": 0 # بعدا می‌توانیم منطق فروش امروز را اضافه کنیم
    })

# --- 6. دریافت اطلاعات کاربر لاگین شده ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)