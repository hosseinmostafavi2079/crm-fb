import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
   
# مسیر پایه پروژه
BASE_DIR = Path(__file__).resolve().parent.parent

# --- تنظیمات امنیتی ---
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-test-key-change-me')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

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
    'corsheaders',          # برای مدیریت CORS
    
    # اپلیکیشن اصلی ما
    'core',
]

MIDDLEWARE = [
    # --------------------------------------------------------
    # نکته حیاتی: این خط باید حتماً اولین گزینه باشد
    'corsheaders.middleware.CorsMiddleware',
    # --------------------------------------------------------
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
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
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# --- احراز هویت و پسورد ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# مدل یوزر اختصاصی
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
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# --- تنظیمات JWT (توکن‌های امنیتی) ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --------------------------------------------------------
# تنظیمات دقیق و اصلاح شده CORS
# --------------------------------------------------------

# ۱. برای امنیت بیشتر در حالت پروداکشن False باشد
CORS_ALLOW_ALL_ORIGINS = False 

# ۲. لیست سفید دامنه‌ها (آدرس فرانت‌اند شما)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# اضافه کردن دامنه‌های احتمالی از فایل .env
env_origins = os.environ.get('CORS_ALLOWED_ORIGINS')
if env_origins:
    CORS_ALLOWED_ORIGINS += env_origins.split(',')

# ۳. اجازه ارسال کوکی و اطلاعات احراز هویت
CORS_ALLOW_CREDENTIALS = False

# ۴. لیست هدرهای مجاز (Authorization برای JWT ضروری است)
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_PREFLIGHT_MAX_AGE = 0