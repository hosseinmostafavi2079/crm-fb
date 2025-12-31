from rest_framework import serializers
from .models import User, Customer, Product, Invoice, SystemConfig, AuditLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'phone', 'is_customer', 'email']

class CustomerSerializer(serializers.ModelSerializer):
    # فیلدهای فقط خواندنی برای نمایش شمسی
    jalali_buy_date = serializers.ReadOnlyField()
    jalali_exit_date = serializers.ReadOnlyField()
    jalali_warranty_end = serializers.ReadOnlyField()
    jalali_expiry_date = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = '__all__' # این خط باعث می‌شود تمام فیلدهای جدید مدل (مدل، گارانتی و...) خودکار اضافه شوند

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.name')
    class Meta:
        model = Invoice
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