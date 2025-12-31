import os
from pathlib import Path
from datetime import timedelta

# مسیر پایه پروژه
BASE_DIR = Path(__file__).resolve().parent.parent

# --- تنظیمات امنیتی (بعداً در سرور واقعی تغییر می‌دهیم) ---
SECRET_KEY = 'django-insecure-change-me-later-for-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

# --- اپلیکیشن‌های نصب شده ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # ابزارهای جانبی
    'rest_framework',       # برای ساخت API
    'corsheaders',          # برای اجازه دسترسی به React
    
    # اپلیکیشن اصلی ما
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    'corsheaders.middleware.CorsMiddleware', # باید قبل از CommonMiddleware باشد
    'django.middleware.common.CommonMiddleware',
    
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --- تنظیمات دیتابیس (PostgreSQL) ---
# فعلاً این را تنظیم می‌کنیم. در مرحله دیتابیس، این بخش را فعال خواهیم کرد.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mostech_crm',
        'USER': 'postgres',       # یوزر پیش‌فرض پستگرس
        'PASSWORD': 'QWer1234@',        # بعدا پسورد خودتان را ست می‌کنید
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# --- احراز هویت و پسورد ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# مدل یوزر اختصاصی (برای آینده‌نگری)
AUTH_USER_MODEL = 'core.User'

LANGUAGE_CODE = 'fa-ir' # فارسی
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# --- تنظیمات REST FRAMEWORK (API) ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # پیش‌فرض: همه چیز قفل است مگر لاگین باشید
    ]
}

# --- تنظیمات JWT (توکن‌های امنیتی) ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1), # توکن ۱ روز اعتبار دارد
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- تنظیمات CORS (اتصال به فرانت‌اند) ---
CORS_ALLOW_ALL_ORIGINS = True # فعلاً برای راحتی کار باز است