from pydantic import BaseModel
from typing import Optional, List

# --- مدل‌های احراز هویت ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- مدل محصول (طبق عکس image_cad9fb) ---
class Product(BaseModel):
    name: str
    price: int
    days_condition: Optional[int] = 0   # شرط روز (مثلا اگر ۳۰ روز مانده بود)
    keyword: Optional[str] = ""         # کلمه کلیدی (مثلا nod)

# --- مدل مشتری (طبق عکس image_cada1a) ---
class Customer(BaseModel):
    CustomerID: Optional[int] = None
    Name: str
    Phone: str
    # اطلاعات دستگاه
    Device: Optional[str] = "-"
    Model: Optional[str] = "-"
    Serial: Optional[str] = "-"
    WarrantyDate: Optional[str] = "-"
    # اطلاعات آنتی‌ویروس
    Antivirus: Optional[str] = "-"
    AntivirusDate: Optional[str] = "-"
    BuyDate: Optional[str] = "-"
    Notes: Optional[str] = ""

# --- مدل فاکتور ---
class InvoiceCreate(BaseModel):
    CustomerID: int
    CustomerName: str
    Phone: str
    Service: str
    Amount: int

# ... (کدهای قبلی)

# مدل قانون یادآوری (طبق reminder_system.py)
class ReminderRule(BaseModel):
    type: str  # warranty یا antivirus
    days: int
    msg: str

# مدل درخواست ثبت سفارش جدید (برای مشتری موجود)
class ServiceCreate(BaseModel):
    CustomerID: int
    Device: str
    Model: Optional[str] = "-"
    Serial: Optional[str] = "-"
    WarrantyDate: Optional[str] = "-"
    Antivirus: Optional[str] = "-"
    AntivirusDate: Optional[str] = "-"
    Notes: Optional[str] = ""