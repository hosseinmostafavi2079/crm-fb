import os
import sys
import django
from django.conf import settings

# تنظیم محیط جنگو
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# 1. پیدا کردن مسیر دیتابیس
db_path = settings.DATABASES['default']['NAME']
print(f"--- DATABASE FOUND AT: {db_path} ---")

# 2. حذف دیتابیس
if os.path.exists(db_path):
    try:
        os.remove(db_path)
        print("✅ Database file DELETED successfully.")
    except Exception as e:
        print(f"❌ Error deleting database: {e}")
        print("Please close any open programs/servers and try again.")
else:
    print("⚠️ Database file not found at this location.")

# 3. حذف مایگریشن‌های قدیمی
base_dir = settings.BASE_DIR
migrations_dir = os.path.join(base_dir, 'core', 'migrations')

if os.path.exists(migrations_dir):
    for filename in os.listdir(migrations_dir):
        if filename != '__init__.py' and filename.endswith('.py'):
            file_path = os.path.join(migrations_dir, filename)
            try:
                os.remove(file_path)
                print(f"✅ Migration deleted: {filename}")
            except Exception as e:
                print(f"❌ Error deleting migration {filename}: {e}")

print("\n--- CLEANUP COMPLETE ---")
print("Now run these commands in your terminal:")
print("1. python manage.py makemigrations core")
print("2. python manage.py migrate")
print("3. python manage.py createsuperuser")