from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
import jdatetime

class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True, verbose_name="شماره تماس")
    is_customer = models.BooleanField(default=False, verbose_name="آیا مشتری است؟")
    def __str__(self): return self.username

class Customer(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام مشتری")
    phone = models.CharField(max_length=20, unique=True, verbose_name="شماره تماس")
    
    # مشخصات دستگاه
    device = models.CharField(max_length=100, blank=True, verbose_name="برند") 
    model = models.CharField(max_length=100, blank=True, verbose_name="مدل")   # <--- جدید
    serial = models.CharField(max_length=100, blank=True, verbose_name="شماره سریال")
    description = models.TextField(blank=True, verbose_name="توضیحات/ایرادات") # <--- جدید
    
    # گارانتی
    warranty_name = models.CharField(max_length=100, blank=True, verbose_name="شرکت گارانتی") # <--- جدید
    warranty_end = models.DateField(null=True, blank=True, verbose_name="پایان گارانتی") # <--- جدید
    
    # تاریخ‌ها
    buy_date = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ پذیرش")
    exit_date = models.DateField(null=True, blank=True, verbose_name="تاریخ خروج") # <--- جدید
    
    # سرویس‌ها
    has_windows = models.BooleanField(default=False, verbose_name="نصب ویندوز")
    
    # تغییر نوع آنتی‌ویروس برای پشتیبانی از داده‌های اکسل
    ANTIVIRUS_CHOICES = (('none', 'ندارد'), ('single', 'تک کاربره'), ('double', 'دو کاربره'))
    antivirus_type = models.CharField(max_length=20, choices=ANTIVIRUS_CHOICES, default='none', verbose_name="نوع آنتی‌ویروس")
    antivirus_expiry = models.DateField(null=True, blank=True, verbose_name="انقضای آنتی‌ویروس")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.name

    # توابع نمایش شمسی
    @property
    def jalali_buy_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.buy_date).strftime('%Y/%m/%d')
    @property
    def jalali_exit_date(self):
        return jdatetime.date.fromgregorian(date=self.exit_date).strftime('%Y/%m/%d') if self.exit_date else "-"
    @property
    def jalali_warranty_end(self):
        return jdatetime.date.fromgregorian(date=self.warranty_end).strftime('%Y/%m/%d') if self.warranty_end else "-"
    @property
    def jalali_expiry_date(self):
        return jdatetime.date.fromgregorian(date=self.antivirus_expiry).strftime('%Y/%m/%d') if self.antivirus_expiry else "-"

# --- بقیه مدل‌ها (بدون تغییر) ---
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.BigIntegerField()
    days_condition = models.IntegerField(default=30)
    keyword = models.CharField(max_length=50, blank=True, null=True)

class Invoice(models.Model):
    STATUS_CHOICES = (('pending', 'در انتظار'), ('paid', 'پرداخت شده'), ('unpaid', 'پرداخت نشده'))
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    service_name = models.CharField(max_length=255)
    amount = models.BigIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True)

class SystemConfig(models.Model):
    sms_api_key = models.CharField(max_length=255, blank=True)
    backup_interval_hours = models.IntegerField(default=24)

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)