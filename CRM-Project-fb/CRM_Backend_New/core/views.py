from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.core.management import call_command
from datetime import timedelta
import pandas as pd
import jdatetime
import os
import glob
from .models import *
from .serializers import *
from django.db import transaction

# مسیر ذخیره بکاپ‌ها
BACKUP_DIR = 'backups/'

# تابع ارسال (شبیه‌سازی)
def send_sms_api(phone, message):
    # اینجا کد واقعی اتصال به پنل پیامک قرار می‌گیرد
    print(f"--- Sending SMS to {phone}: {message} ---")
    return True

# --- 1. مدیریت قالب‌ها ---
class SMSTemplateViewSet(viewsets.ModelViewSet):
    queryset = SMSTemplate.objects.all()
    serializer_class = SMSTemplateSerializer
    permission_classes = [IsAdminUser]

# --- 2. مدیریت قوانین و اجرای خودکار ---
class NotificationRuleViewSet(viewsets.ModelViewSet):
    queryset = NotificationRule.objects.all()
    serializer_class = NotificationRuleSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['POST'])
    def restore_backup(self, request):
        """بازگردانی اطلاعات از فایل بکاپ با پاکسازی داده‌های قبلی"""
        filename = request.data.get('filename')
        if not filename:
            return Response({"error": "نام فایل الزامی است"}, status=400)
            
        filepath = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(filepath):
            return Response({"error": "فایل یافت نشد"}, status=404)
            
        try:
            with transaction.atomic():
                # 1. پاکسازی داده‌های قدیمی برای جلوگیری از تداخل (به ترتیب وابستگی)
                print("--- Cleaning up old data ---")
                SMSLog.objects.all().delete()
                ServiceLog.objects.all().delete()
                Device.objects.all().delete()
                Customer.objects.all().delete()
                NotificationRule.objects.all().delete()
                SMSTemplate.objects.all().delete()
                # نکته: کاربران (User) را پاک نمی‌کنیم تا نشست ادمین قطع نشود.
                # loaddata اطلاعات کاربران را بروزرسانی می‌کند.

                # 2. بارگذاری داده‌های بکاپ
                print(f"--- Loading data from {filename} ---")
                call_command('loaddata', filepath)
            
            AuditLog.objects.create(user=request.user, action='BACKUP_RESTORED', details=filename)
            return Response({"message": "اطلاعات با موفقیت بازگردانی و جایگزین شد."})
            
        except Exception as e:
            # چاپ خطا در کنسول سرور برای دیباگ
            print(f"Error restoring backup: {e}")
            return Response({"error": f"خطا در بازگردانی: {str(e)}"}, status=500)

# --- 3. تاریخچه و ارسال دستی ---
class SMSLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SMSLog.objects.all().order_by('-sent_at')
    serializer_class = SMSLogSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['POST'])
    def preview_smart_send(self, request):
        service_type = request.data.get('service_type', 'antivirus')
        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({"error": "بازه زمانی نامعتبر است"}, status=400)

        try:
            s_part = str(start_date_str).split('T')[0].replace('-', '/')
            e_part = str(end_date_str).split('T')[0].replace('-', '/')
            start_date = jdatetime.datetime.strptime(s_part, '%Y/%m/%d').date().togregorian()
            end_date = jdatetime.datetime.strptime(e_part, '%Y/%m/%d').date().togregorian()
        except:
            return Response({"error": "فرمت تاریخ اشتباه است"}, status=400)

        if service_type == 'warranty':
            qs = Device.objects.filter(warranty_end__range=[start_date, end_date])
        else:
            qs = Device.objects.filter(antivirus_expiry__range=[start_date, end_date])

        results = []
        for dev in qs:
            expiry = dev.jalali_warranty_end if service_type == 'warranty' else dev.jalali_expiry_date
            results.append({
                'id': dev.id,
                'customer': dev.customer.name,
                'phone': dev.customer.phone,
                'device': f"{dev.device_name} {dev.model}",
                'expiry_date': expiry
            })
        
        return Response(results)

    @action(detail=False, methods=['POST'])
    def send_bulk(self, request):
        device_ids = request.data.get('device_ids', [])
        message = request.data.get('message', '')
        
        if not device_ids or not message:
            return Response({"error": "اطلاعات ناقص است"}, status=400)
        
        count = 0
        devices = Device.objects.filter(id__in=device_ids)
        for dev in devices:
            final_msg = message.replace('{name}', dev.customer.name).replace('{device}', dev.device_name)
            send_sms_api(dev.customer.phone, final_msg)
            
            SMSLog.objects.create(
                device=dev,
                recipient_phone=dev.customer.phone,
                message_body=final_msg,
                status='sent',
                rule_name='دستی'
            )
            count += 1
            
        return Response({"message": f"{count} پیامک ارسال شد"})

# --- بقیه ویوها (مشتری، تنظیمات و...) ---
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['phone', 'name', 'devices__serial']

    def create(self, request, *args, **kwargs):
        data = request.data
        phone = data.get('phone')
        name = data.get('name')
        if not phone: return Response({"error": "شماره تماس الزامی است"}, status=400)
        
        customer, created = Customer.objects.get_or_create(phone=phone, defaults={'name': name})
        if not created and name: 
            customer.name = name
            customer.save()
        
        exit_date_str = data.get('exit_date')
        exit_date = timezone.now().date()
        if exit_date_str:
            try:
                date_part = str(exit_date_str).split('T')[0].replace('-', '/')
                j_date = jdatetime.datetime.strptime(date_part, '%Y/%m/%d').date()
                exit_date = j_date.togregorian()
            except: pass

        av_type = data.get('antivirus_type', 'none')
        av_expiry = None
        if av_type in ['single', 'double']: 
            av_expiry = exit_date + timedelta(days=365)

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

        Device.objects.create(
            customer=customer, device_name=data.get('device', ''), model=data.get('model', ''),
            serial=data.get('serial', ''), description=data.get('description', ''),
            warranty_name=data.get('warranty_name', ''), warranty_end=warranty_end,
            exit_date=exit_date, has_windows=data.get('has_windows', False),
            antivirus_type=av_type, antivirus_expiry=av_expiry
        )
        return Response({"message": "ثبت شد", "customer_id": customer.id}, status=201)

    @action(detail=True, methods=['POST'], url_path='renew_service')
    def renew_service(self, request, pk=None):
        device_id = request.data.get('device_id')
        service_type = request.data.get('service_type')
        duration_months = int(request.data.get('duration_months', 12))
        description = request.data.get('description', '')
        user_count = int(request.data.get('user_count', 1))

        try: 
            device = Device.objects.get(id=device_id)
        except Device.DoesNotExist: 
            return Response({"error": "دستگاه یافت نشد"}, status=404)

        today = timezone.now().date()
        new_end_date = today + timedelta(days=30 * duration_months)

        if service_type == 'warranty':
            device.warranty_end = new_end_date
            device.save()
            ServiceLog.objects.create(device=device, service_type='warranty', start_date=today, end_date=new_end_date, duration_months=duration_months, description=description)
        elif service_type == 'antivirus':
            device.antivirus_expiry = new_end_date
            device.antivirus_type = 'single' if user_count == 1 else 'double'
            device.save()
            ServiceLog.objects.create(device=device, service_type='antivirus', start_date=today, end_date=new_end_date, duration_months=duration_months, user_count=user_count)
        return Response({"message": "تمدید شد"}, status=200)

    @action(detail=False, methods=['POST'])
    def import_excel(self, request):
        file = request.FILES.get('file')
        if not file: return Response({"error": "فایل ارسال نشد"}, status=400)
        try:
            df = pd.read_excel(file)
            count = 0
            for _, row in df.iterrows():
                raw_phone = str(row.get('موبایل', row.get('Phone', '')))
                phone = raw_phone.split('.')[0].strip()
                if len(phone) < 4: continue
                
                name = row.get('نام و نام خانوادگی', row.get('Name', 'بدون نام'))
                customer, _ = Customer.objects.get_or_create(phone=phone, defaults={'name': name})
                
                device_name = row.get('دستگاه', row.get('Device', ''))
                model = row.get('مدل', row.get('Model', ''))
                serial = row.get('سریال', row.get('Serial', ''))
                warranty_name = row.get('گارانتی', row.get('Warranty', ''))
                
                exit_date = timezone.now().date()
                # تلاش برای خواندن تاریخ خروج از اکسل
                exit_date_raw = str(row.get('تاریخ خروج', ''))
                if exit_date_raw and exit_date_raw.lower() != 'nan':
                    try:
                        clean = exit_date_raw.split(' ')[0].strip()
                        j_d = jdatetime.datetime.strptime(clean, '%Y/%m/%d').date()
                        exit_date = j_d.togregorian()
                    except: pass

                win_val = str(row.get('ویندوز', '')).lower()
                av_val = str(row.get('انتی ویروس', '')).lower()
                has_win = 'win' in win_val
                has_av = 'nod' in av_val
                av_type = 'single' if has_av else 'none'
                av_expiry = exit_date + timedelta(days=365) if has_av else None

                Device.objects.create(customer=customer, device_name=device_name, model=model, serial=serial, warranty_name=warranty_name, exit_date=exit_date, has_windows=has_win, antivirus_type=av_type, antivirus_expiry=av_expiry)
                count += 1
            return Response({"imported": count})
        except Exception as e: return Response({"error": str(e)}, status=400)

class ConfigViewSet(viewsets.ModelViewSet):
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAdminUser]

    # --- مدیریت بکاپ و بازگردانی ---
    @action(detail=False, methods=['POST'])
    def trigger_backup(self, request):
        """اجرای بکاپ کامل (شامل تمام دیتابیس)"""
        try:
            if not os.path.exists(BACKUP_DIR):
                os.makedirs(BACKUP_DIR)
            
            # نام فایل: backup_YYYY-MM-DD_HH-MM.json
            timestamp = jdatetime.datetime.now().strftime('%Y-%m-%d_%H-%M')
            filename = f"backup_{timestamp}.json"
            filepath = os.path.join(BACKUP_DIR, filename)
            
            # اجرای دامپ کامل دیتابیس (شامل core و auth)
            # استفاده از core و auth.User برای جلوگیری از مشکلات پرمیشن‌های اضافی، اما دیتای اصلی حفظ می‌شود.
            with open(filepath, 'w', encoding='utf-8') as f:
                call_command('dumpdata', 'core', 'auth.User', indent=2, stdout=f)
            
            # بروزرسانی تنظیمات و ثبت آخرین زمان بکاپ
            config = SystemConfig.objects.first()
            if config:
                config.last_backup_at = timezone.now()
                config.save()
                
                # --- اجرای سیاست نگهداری (Rotation) ---
                retention = config.backup_retention_count
                files = sorted(glob.glob(os.path.join(BACKUP_DIR, "backup_*.json")), key=os.path.getmtime)
                
                # حذف فایل‌های قدیمی
                while len(files) > retention:
                    oldest_file = files.pop(0)
                    os.remove(oldest_file)
            
            AuditLog.objects.create(user=request.user, action='BACKUP_CREATED', details=filename)
            return Response({"message": "بکاپ با موفقیت ایجاد شد", "file": filename})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['POST'])
    def restore_backup(self, request):
        """بازگردانی اطلاعات از فایل بکاپ"""
        filename = request.data.get('filename')
        if not filename:
            return Response({"error": "نام فایل الزامی است"}, status=400)
            
        filepath = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(filepath):
            return Response({"error": "فایل یافت نشد"}, status=404)
            
        try:
            # بارگذاری مجدد اطلاعات (Loaddata)
            call_command('loaddata', filepath)
            
            AuditLog.objects.create(user=request.user, action='BACKUP_RESTORED', details=filename)
            return Response({"message": "اطلاعات با موفقیت بازگردانی شد."})
        except Exception as e:
            return Response({"error": f"خطا در بازگردانی: {str(e)}"}, status=500)

    @action(detail=False, methods=['GET'])
    def list_backups(self, request):
        """لیست کردن فایل‌های بکاپ موجود"""
        if not os.path.exists(BACKUP_DIR):
            return Response([])
            
        files = sorted(glob.glob(os.path.join(BACKUP_DIR, "backup_*.json")), key=os.path.getmtime, reverse=True)
        data = []
        for f in files:
            size_mb = round(os.path.getsize(f) / (1024 * 1024), 2)
            name = os.path.basename(f)
            created = jdatetime.datetime.fromtimestamp(os.path.getmtime(f)).strftime('%Y/%m/%d %H:%M')
            data.append({"name": name, "size": f"{size_mb} MB", "created": created})
        
        return Response(data)

    @action(detail=False, methods=['GET'], url_path='download_backup/(?P<filename>[^/.]+)')
    def download_backup(self, request, filename=None):
        filepath = os.path.join(BACKUP_DIR, f"{filename}.json")
        if os.path.exists(filepath):
            return FileResponse(open(filepath, 'rb'), as_attachment=True, filename=f"{filename}.json")
        return Response({"error": "فایل یافت نشد"}, status=404)

class LogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['GET'])
    def export_excel(self, request):
        logs = self.get_queryset()
        data = []
        for log in logs:
            u_name = log.user.username if log.user else 'System'
            j_date = jdatetime.datetime.fromgregorian(datetime=log.timestamp).strftime('%Y/%m/%d %H:%M')
            
            data.append({
                'کاربر': u_name,
                'عملیات': log.action,
                'جزئیات': log.details,
                'زمان': j_date
            })
        
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="system_logs.xlsx"'
        df.to_excel(response, index=False)
        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_cust = Customer.objects.count()
    total_dev = Device.objects.count()
    today = timezone.now().date()
    expired = Device.objects.filter(antivirus_expiry__lt=today).count()
    warning = Device.objects.filter(antivirus_expiry__gte=today, antivirus_expiry__lt=today + timedelta(days=30)).count()
    return Response({"total_customers": total_cust, "total_devices": total_dev, "expired_antivirus": expired, "warning_antivirus": warning})