from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import jdatetime

# --- 1. مدل کاربران (ادمین و مشتری) ---
class User(AbstractUser):
    phone = models.CharField(max_length=15, unique=True, verbose_name="شماره موبایل")
    is_customer = models.BooleanField(default=False, verbose_name="آیا مشتری است؟")
    
    def __str__(self):
        return f"{self.username} ({'مشتری' if self.is_customer else 'ادمین'})"

# --- 2. مدل محصولات (جایگزین products.json) ---
class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="نام محصول")
    price = models.BigIntegerField(verbose_name="قیمت (تومان)")
    days_condition = models.IntegerField(default=30, verbose_name="مدت اعتبار (روز)")
    keyword = models.CharField(max_length=50, blank=True, null=True, verbose_name="کلمه کلیدی (nod/vpn)")
    
    def __str__(self):
        return self.name

# --- 3. مدل مشتریان (جایگزین customers.xlsx) ---
class Customer(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile', verbose_name="اکانت کاربری")
    name = models.CharField(max_length=255, verbose_name="نام و نام خانوادگی")
    phone = models.CharField(max_length=15, unique=True, verbose_name="شماره موبایل")
    
    # مشخصات دستگاه
    device = models.CharField(max_length=100, default="-", verbose_name="نوع دستگاه")
    model = models.CharField(max_length=100, default="-", verbose_name="مدل")
    serial = models.CharField(max_length=100, default="-", verbose_name="شماره سریال")
    
    # تاریخ‌ها (بصورت رشته ذخیره می‌کنیم یا DateField - برای سادگی فعلا DateField استاندارد)
    warranty_date = models.DateField(null=True, blank=True, verbose_name="تاریخ گارانتی")
    buy_date = models.DateField(default=timezone.now, verbose_name="تاریخ خرید")
    
    # اطلاعات آنتی‌ویروس
    antivirus_name = models.CharField(max_length=100, default="-", verbose_name="نام آنتی‌ویروس")
    antivirus_expiry = models.DateField(null=True, blank=True, verbose_name="تاریخ انقضا آنتی‌ویروس")
    
    notes = models.TextField(blank=True, default="-", verbose_name="توضیحات")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"
    
    @property
    def jalali_buy_date(self):
        return jdatetime.date.fromgregorian(date=self.buy_date).strftime("%Y/%m/%d")

# --- 4. مدل فاکتورها (جایگزین payments.xlsx) ---
class Invoice(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار بررسی'),
        ('paid', 'پرداخت شده'),
        ('unpaid', 'پرداخت نشده'),
        ('canceled', 'لغو شده'),
    )
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices', verbose_name="مشتری")
    service_name = models.CharField(max_length=255, verbose_name="نام سرویس/محصول")
    amount = models.BigIntegerField(verbose_name="مبلغ (تومان)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid', verbose_name="وضعیت")
    
    license_code = models.CharField(max_length=500, default="-", verbose_name="کد لایسنس تحویل داده شده")
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True, verbose_name="تصویر فیش")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"فاکتور {self.id} - {self.customer.name}"

# --- 5. تنظیمات سیستم (جایگزین فایل‌های json کانفیگ) ---
class SystemConfig(models.Model):
    # تنظیمات پیامک
    sms_api_key = models.CharField(max_length=255, blank=True, verbose_name="کلید API پیامک")
    sms_sender = models.CharField(max_length=50, blank=True, verbose_name="شماره فرستنده")
    
    # تنظیمات بکاپ
    backup_interval_hours = models.IntegerField(default=24, verbose_name="فاصله بکاپ (ساعت)")
    
    class Meta:
        verbose_name = "تنظیمات سیستم"
        verbose_name_plural = "تنظیمات سیستم"

    def __str__(self):
        return "تنظیمات اصلی (فقط یک رکورد باشد)"

# --- 6. لاگ سیستم (Audit Log) ---
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="کاربر")
    action = models.CharField(max_length=255, verbose_name="عملیات")
    details = models.TextField(blank=True, verbose_name="جزئیات")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action}"