from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta
import pandas as pd
import jdatetime
from .models import *
from .serializers import *

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    # ثبت دستی (از طریق فرم)
    def perform_create(self, serializer):
        data = self.request.data
        
        # تاریخ خروج (تبدیل از شمسی دیت‌پیکر)
        exit_date_str = data.get('exit_date')
        exit_date = timezone.now().date()
        if exit_date_str:
            try:
                # هندل کردن انواع فرمت‌ها
                date_part = str(exit_date_str).split('T')[0].replace('-', '/')
                j_date = jdatetime.datetime.strptime(date_part, '%Y/%m/%d').date()
                exit_date = j_date.togregorian()
            except: pass

        # محاسبه انقضای آنتی‌ویروس
        av_type = data.get('antivirus_type', 'none')
        av_expiry = None
        if av_type in ['single', 'double']:
            av_expiry = exit_date + timedelta(days=365)

        # محاسبه گارانتی
        warranty_end = None
        mode = data.get('warranty_mode', 'month')
        if mode == 'month':
            try:
                months = int(data.get('warranty_months', 0))
                if months > 0: warranty_end = exit_date + timedelta(days=30*months)
            except: pass
        elif mode == 'date':
            w_date_str = data.get('warranty_end_date')
            if w_date_str:
                try:
                    w_part = str(w_date_str).split('T')[0].replace('-', '/')
                    j_w = jdatetime.datetime.strptime(w_part, '%Y/%m/%d').date()
                    warranty_end = j_w.togregorian()
                except: pass

        serializer.save(
            device=data.get('device', ''),
            model=data.get('model', ''),
            description=data.get('description', ''),
            warranty_name=data.get('warranty_name', ''),
            exit_date=exit_date,
            antivirus_expiry=av_expiry,
            warranty_end=warranty_end
        )

    # ایمپورت اکسل (دقیقاً طبق فایل نمونه شما)
    @action(detail=False, methods=['POST'])
    def import_excel(self, request):
        file = request.FILES.get('file')
        if not file: return Response({"error": "فایل ارسال نشد"}, status=400)

        try:
            df = pd.read_excel(file)
            count = 0
            for _, row in df.iterrows():
                # 1. خواندن موبایل (ستون B)
                raw_phone = str(row.get('موبایل', row.get('Phone', '')))
                phone = raw_phone.split('.')[0].strip()
                if len(phone) < 4: continue

                # 2. خواندن اطلاعات متنی
                # تطبیق با هدرهای اکسل شما: نام و نام خانوادگی، دستگاه، مدل، سریال، گارانتی
                name = row.get('نام و نام خانوادگی', row.get('Name', row.get('نام', 'بدون نام')))
                device = row.get('دستگاه', row.get('Device', ''))
                model = row.get('مدل', row.get('Model', ''))
                serial = row.get('سریال', row.get('Serial', ''))
                warranty_name = row.get('گارانتی', row.get('Warranty', ''))
                
                # 3. تبدیل تاریخ‌ها (شمسی اکسل به میلادی دیتابیس)
                # تاریخ خروج
                exit_date_raw = str(row.get('تاریخ خروج', ''))
                exit_date = timezone.now().date()
                if exit_date_raw and exit_date_raw.lower() != 'nan':
                    try:
                        j_d = jdatetime.datetime.strptime(exit_date_raw.strip(), '%Y/%m/%d').date()
                        exit_date = j_d.togregorian()
                    except: pass
                
                # تاریخ گارانتی
                warranty_end_raw = str(row.get('تاریخ گارانتی', ''))
                warranty_end = None
                if warranty_end_raw and warranty_end_raw.lower() != 'nan':
                    try:
                        j_w = jdatetime.datetime.strptime(warranty_end_raw.strip(), '%Y/%m/%d').date()
                        warranty_end = j_w.togregorian()
                    except: pass

                # 4. سرویس‌ها
                win_val = str(row.get('ویندوز', '')).lower()
                av_val = str(row.get('انتی ویروس', '')).lower() # ستون J اکسل شما
                
                has_win = 'win' in win_val
                has_av = 'nod' in av_val
                
                av_type = 'single' if has_av else 'none'
                av_expiry = None
                if has_av:
                    av_expiry = exit_date + timedelta(days=365)

                # ذخیره در دیتابیس (آپدیت اگر شماره تکراری بود)
                Customer.objects.update_or_create(
                    phone=phone,
                    defaults={
                        'name': name,
                        'device': device,
                        'model': model,
                        'serial': serial,
                        'warranty_name': warranty_name,
                        'warranty_end': warranty_end,
                        'exit_date': exit_date,
                        'has_windows': has_win,
                        'antivirus_type': av_type,
                        'antivirus_expiry': av_expiry
                    }
                )
                count += 1
            
            return Response({"imported": count})
        except Exception as e:
            return Response({"error": f"خطا در پردازش اکسل: {str(e)}"}, status=400)

# --- بقیه کلاس‌های ویو (بدون تغییر) ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

class ConfigViewSet(viewsets.ModelViewSet):
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAdminUser]

class LogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total = Customer.objects.count()
    today = timezone.now().date()
    expired = Customer.objects.filter(antivirus_expiry__lt=today).count()
    warning = Customer.objects.filter(antivirus_expiry__gte=today, antivirus_expiry__lt=today + timedelta(days=30)).count()
    return Response({
        "total_customers": total, 
        "expired_antivirus": expired, 
        "warning_antivirus": warning, 
        "total_invoices": Invoice.objects.count()
    })