from django.contrib import admin
from .models import User, Customer, Device, ServiceLog, SystemConfig, AuditLog, SMSTemplate, NotificationRule, SMSLog

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'phone', 'is_customer')

class DeviceInline(admin.TabularInline):
    model = Device
    extra = 0
    fields = ('device_name', 'model', 'warranty_end', 'antivirus_expiry')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone')
    inlines = [DeviceInline]

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('device_name', 'model', 'warranty_end', 'antivirus_expiry')

@admin.register(SMSTemplate)
class SMSTemplateAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(NotificationRule)
class NotificationRuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'days_before', 'is_active')

@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('recipient_phone', 'status', 'sent_at')

@admin.register(SystemConfig)
class ConfigAdmin(admin.ModelAdmin):
    list_display = ('backup_interval_hours',)

@admin.register(AuditLog)
class LogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp')