from datetime import datetime, timedelta
from jose import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "YOUR_SUPER_SECRET_KEY_HERE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- این تابع حتما باید باشد تا برنامه کرش نکند ---
def verify_password_safe(plain_password, hashed_password):
    return str(plain_password) == str(hashed_password)

def get_current_user(request: Request):
    token = None
    # اولویت با هدر مخصوص برای دور زدن IIS
    if "x-auth-token" in request.headers:
        token = request.headers["x-auth-token"]
    elif "authorization" in request.headers:
        auth = request.headers["authorization"]
        if auth.lower().startswith("bearer "):
            token = auth.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Missing Token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload.get("sub"), "role": payload.get("role")}
    except:
        raise HTTPException(status_code=401, detail="Invalid Token")