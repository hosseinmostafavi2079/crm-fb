from rest_framework import serializers
from .models import User, Customer, Device, ServiceLog, SystemConfig, AuditLog, SMSTemplate, NotificationRule, SMSLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'phone', 'is_customer', 'email']

class ServiceLogSerializer(serializers.ModelSerializer):
    jalali_start_date = serializers.ReadOnlyField()
    jalali_end_date = serializers.ReadOnlyField()
    class Meta:
        model = ServiceLog
        fields = '__all__'

class DeviceSerializer(serializers.ModelSerializer):
    jalali_exit_date = serializers.ReadOnlyField()
    jalali_warranty_end = serializers.ReadOnlyField()
    jalali_expiry_date = serializers.ReadOnlyField()
    service_logs = ServiceLogSerializer(many=True, read_only=True)
    
    exit_date = serializers.CharField(required=False, allow_null=True, read_only=True)
    warranty_end = serializers.CharField(required=False, allow_null=True, read_only=True)
    antivirus_expiry = serializers.CharField(required=False, allow_null=True, read_only=True)

    class Meta:
        model = Device
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    devices = DeviceSerializer(many=True, read_only=True)
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'devices', 'created_at']

# --- سریالایزرهای پیامک ---
class SMSTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSTemplate
        fields = '__all__'

class NotificationRuleSerializer(serializers.ModelSerializer):
    template_title = serializers.ReadOnlyField(source='template.title')
    class Meta:
        model = NotificationRule
        fields = '__all__'

class SMSLogSerializer(serializers.ModelSerializer):
    jalali_sent_at = serializers.ReadOnlyField()
    device_info = serializers.SerializerMethodField()
    
    def get_device_info(self, obj):
        if obj.device:
            return f"{obj.device.device_name} ({obj.device.customer.name})"
        return "دستگاه حذف شده"

    class Meta:
        model = SMSLog
        fields = '__all__'

class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = AuditLog
        fields = '__all__'