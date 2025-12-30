import os
import shutil
import json
import time
import asyncio
from datetime import datetime

# مسیرهای مهم
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")
CONFIG_FILE = os.path.join(DATA_DIR, "backup_config.json")

# تنظیمات پیش‌فرض
DEFAULT_CONFIG = {
    "interval_hours": 24,    # هر 24 ساعت
    "retention_count": 5,    # نگهداری 5 تا
    "last_run": 0            # آخرین باری که اجرا شده (Timestamp)
}

def get_config():
    if not os.path.exists(CONFIG_FILE):
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except:
        return DEFAULT_CONFIG

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=4)

def create_backup_file():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # اسم فایل بر اساس تاریخ و ساعت
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"backup_{timestamp}"
    archive_path = os.path.join(BACKUP_DIR, filename)
    
    # فشرده‌سازی پوشه data
    shutil.make_archive(archive_path, 'zip', DATA_DIR)
    
    # آپدیت زمان آخرین اجرا
    config = get_config()
    config['last_run'] = time.time()
    save_config(config)
    
    # پاکسازی فایل‌های قدیمی
    cleanup_old_backups(config['retention_count'])
    
    return f"{filename}.zip"

def cleanup_old_backups(limit):
    files = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith('.zip')]
    # مرتب‌سازی بر اساس زمان ایجاد (قدیمی به جدید)
    files.sort(key=os.path.getctime)
    
    # اگر تعداد بیشتر از حد مجاز بود، قدیمی‌ها را پاک کن
    if len(files) > limit:
        to_remove = len(files) - limit
        for i in range(to_remove):
            os.remove(files[i])
            print(f"Old backup deleted: {files[i]}")

# تسک پس‌زمینه که مدام چک می‌کند وقت بکاپ شده یا نه
async def backup_scheduler():
    while True:
        try:
            config = get_config()
            interval_seconds = config['interval_hours'] * 3600
            
            # اگر زمانش رسیده بود
            if time.time() - config['last_run'] > interval_seconds:
                print("⏳ Starting automatic backup...")
                create_backup_file()
                print("✅ Backup completed.")
            
        except Exception as e:
            print(f"Backup Error: {e}")
        
        # هر 10 دقیقه چک کن (نه هر ثانیه، که فشار نیاد)
        await asyncio.sleep(600)