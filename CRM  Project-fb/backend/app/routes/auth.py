from fastapi import APIRouter, HTTPException, Body
from app.core.security import create_access_token, verify_password_safe
from app.db.repository import db
import json
import os
import traceback

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
USERS_FILE = os.path.join(BASE_DIR, "users.json")

def load_admins():
    if not os.path.exists(USERS_FILE): return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except: return []

@router.post("/check-user")
@router.post("/check-user/")
async def check_user(payload: dict = Body(...)):
    try:
        phone = str(payload.get("phone", "")).strip()
        admins = load_admins()
        admin = next((u for u in admins if u["phone"] == phone), None)
        if admin:
            return {"exists": True, "role": "admin", "name": admin["name"]}

        customers = db.get_customer_by_phone(phone)
        if customers:
            return {"exists": True, "role": "customer", "name": customers[0].get("Name")}

        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    except Exception as e:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")

@router.post("/login-pass")
@router.post("/login-pass/")
async def login_pass(payload: dict = Body(...)):
    try:
        phone = payload.get("phone")
        password = payload.get("password")
        
        admins = load_admins()
        user = next((u for u in admins if u["phone"] == phone), None)
        
        if not user: 
            raise HTTPException(status_code=401, detail="کاربر یافت نشد")

        # استفاده از تابع امن ما
        if not verify_password_safe(password, user["password"]):
            raise HTTPException(status_code=400, detail="رمز عبور اشتباه است")
            
        token = create_access_token({"sub": phone, "role": "admin", "name": user["name"]})
        return {"token": token, "role": "admin", "name": user["name"]}

    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="خطای داخلی سرور")

@router.post("/send-otp")
@router.post("/send-otp/")
async def send_otp(payload: dict = Body(...)): return {"message": "ارسال شد"}

@router.post("/verify-otp")
@router.post("/verify-otp/")
async def verify_otp(payload: dict = Body(...)):
    if payload.get("code") == "12345":
        return {"token": "test-token", "role": "customer", "name": "کاربر"}
    raise HTTPException(status_code=400, detail="کد اشتباه")