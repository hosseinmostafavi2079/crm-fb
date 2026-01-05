from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'phone', 'is_customer', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('اطلاعات تکمیلی', {'fields': ('phone', 'is_customer')}),
    )

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'created_at']
    search_fields = ['name', 'phone']

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['device_name', 'customer', 'model', 'serial', 'exit_date']
    search_fields = ['serial', 'device_name', 'customer__name']
    list_filter = ['has_windows', 'antivirus_type']

@admin.register(ServiceLog)
class ServiceLogAdmin(admin.ModelAdmin):
    list_display = ['device', 'service_type', 'start_date', 'end_date']

@admin.register(SystemConfig)
class ConfigAdmin(admin.ModelAdmin):
    # اصلاح شده: فیلدهای قدیمی حذف و فیلدهای جدید بکاپ اضافه شدند
    list_display = ['backup_frequency', 'backup_retention_count', 'last_backup_at', 'sms_provider']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'timestamp']
    list_filter = ['action']

@admin.register(SMSTemplate)
class SMSTemplateAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']

@admin.register(NotificationRule)
class NotificationRuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'days_before', 'service_type', 'is_active']
    list_filter = ['is_active', 'service_type']

@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ['recipient_phone', 'status', 'sent_at', 'rule_name']
    list_filter = ['status']