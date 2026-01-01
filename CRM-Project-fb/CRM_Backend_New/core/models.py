from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
import jdatetime
from datetime import timedelta

# --- 1. کاربران ---
class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True, verbose_name="شماره تماس")
    is_customer = models.BooleanField(default=False, verbose_name="آیا مشتری است؟")
    def __str__(self): return self.username

# --- 2. مشتریان ---
class Customer(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام مشتری")
    phone = models.CharField(max_length=20, unique=True, verbose_name="شماره تماس")
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# --- 3. دستگاه‌ها ---
class Device(models.Model):
    customer = models.ForeignKey(Customer, related_name='devices', on_delete=models.CASCADE)
    
    device_name = models.CharField(max_length=100, blank=True, verbose_name="برند")
    model = models.CharField(max_length=100, blank=True, verbose_name="مدل")
    serial = models.CharField(max_length=100, blank=True, verbose_name="شماره سریال")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    
    warranty_name = models.CharField(max_length=100, blank=True, verbose_name="شرکت گارانتی")
    warranty_end = models.DateField(null=True, blank=True, verbose_name="پایان گارانتی")
    
    buy_date = models.DateTimeField(auto_now_add=True)
    exit_date = models.DateField(null=True, blank=True)
    
    has_windows = models.BooleanField(default=False)
    ANTIVIRUS_CHOICES = (('none', 'ندارد'), ('single', 'تک کاربره'), ('double', 'دو کاربره'))
    antivirus_type = models.CharField(max_length=20, choices=ANTIVIRUS_CHOICES, default='none')
    antivirus_expiry = models.DateField(null=True, blank=True)

    @property
    def jalali_exit_date(self):
        return jdatetime.date.fromgregorian(date=self.exit_date).strftime('%Y/%m/%d') if self.exit_date else "-"
    @property
    def jalali_warranty_end(self):
        return jdatetime.date.fromgregorian(date=self.warranty_end).strftime('%Y/%m/%d') if self.warranty_end else "-"
    @property
    def jalali_expiry_date(self):
        return jdatetime.date.fromgregorian(date=self.antivirus_expiry).strftime('%Y/%m/%d') if self.antivirus_expiry else "-"

# --- 4. سوابق تمدید ---
class ServiceLog(models.Model):
    device = models.ForeignKey(Device, related_name='service_logs', on_delete=models.CASCADE)
    SERVICE_TYPES = (('warranty', 'تمدید گارانتی'), ('antivirus', 'تمدید آنتی‌ویروس'))
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField()
    duration_months = models.IntegerField(default=0)
    
    description = models.TextField(blank=True)
    user_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def jalali_start_date(self):
        return jdatetime.date.fromgregorian(date=self.start_date).strftime('%Y/%m/%d')
    @property
    def jalali_end_date(self):
        return jdatetime.date.fromgregorian(date=self.end_date).strftime('%Y/%m/%d')

# --- 5. سیستم پیامک (جدید) ---
class SMSTemplate(models.Model):
    title = models.CharField(max_length=100, verbose_name="عنوان قالب")
    text = models.TextField(verbose_name="متن پیامک")
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class NotificationRule(models.Model):
    SERVICE_TYPES = (('warranty', 'گارانتی'), ('antivirus', 'آنتی‌ویروس'))
    title = models.CharField(max_length=100, verbose_name="عنوان قانون")
    days_before = models.IntegerField(default=7, verbose_name="چند روز قبل از انقضا")
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    template = models.ForeignKey(SMSTemplate, on_delete=models.SET_NULL, null=True, verbose_name="قالب پیامک")
    is_active = models.BooleanField(default=True)
    
    def __str__(self): return f"{self.title} ({self.days_before} روز قبل)"

class SMSLog(models.Model):
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, related_name='sms_logs')
    recipient_phone = models.CharField(max_length=20)
    message_body = models.TextField()
    status = models.CharField(max_length=20, default='sent')
    sent_at = models.DateTimeField(auto_now_add=True)
    rule_name = models.CharField(max_length=100, blank=True, null=True)

    @property
    def jalali_sent_at(self):
        return jdatetime.datetime.fromgregorian(datetime=self.sent_at).strftime('%Y/%m/%d %H:%M')

# --- تنظیمات و لاگ ---
class SystemConfig(models.Model):
    sms_api_key = models.CharField(max_length=255, blank=True)
    backup_interval_hours = models.IntegerField(default=24)

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)