from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Customer, Product, Invoice, SystemConfig, AuditLog

# تنظیمات هدر پنل ادمین
admin.site.site_header = "مدیریت CRM "
admin.site.site_title = "پنل مدیریت"
admin.site.index_title = "داشبورد مدیریت"

# نمایش بهتر مشتریان در لیست
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'device', 'antivirus_expiry')
    search_fields = ('name', 'phone', 'serial')
    list_filter = ('device',)

# نمایش بهتر فاکتورها
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'service_name', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer__name', 'customer__phone', 'license_code')

# ثبت مدل‌ها
admin.site.register(User, UserAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Product)
admin.site.register(Invoice, InvoiceAdmin)
admin.site.register(SystemConfig)
admin.site.register(AuditLog)