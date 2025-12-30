from fastapi import FastAPI, Depends, HTTPException, Body, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.models.schemas import *
from app.db.repository import db
from app.core.security import get_current_user
from app.routes import auth 
from app.utils.backup import create_backup_file, get_config, save_config, backup_scheduler, BACKUP_DIR
import os
import asyncio
from datetime import datetime

app = FastAPI(title="Mostech CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- لاگ کردن درخواست‌ها برای دیباگ ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"📥 Request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"📤 Response: {response.status_code}")
    return response

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(backup_scheduler())

# اتصال ماژول لاگین (حتما با /api/auth)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# --- سایر روت‌ها (مشتریان و ...) ---
@app.get("/customers", dependencies=[Depends(get_current_user)])
def read_customers(): return db.get_all_customers()

@app.post("/customers", dependencies=[Depends(get_current_user)])
def create_customer(customer: Customer): return db.add_customer(customer.dict())

@app.delete("/customers/{customer_id}", dependencies=[Depends(get_current_user)])
def delete_customer(customer_id: int): return db.delete_customer(customer_id)

@app.delete("/customers/all", dependencies=[Depends(get_current_user)])
def delete_all_customers(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin': raise HTTPException(status_code=403)
    db.delete_all_customers()
    return {"status": "success"}

@app.post("/customers/import", dependencies=[Depends(get_current_user)])
async def import_customers(file: UploadFile = File(...)):
    return db.import_customers(await file.read())

@app.post("/tools/clean", dependencies=[Depends(get_current_user)])
def clean_database(): return db.clean_database()

@app.post("/services", dependencies=[Depends(get_current_user)])
def add_service(service: ServiceCreate): return db.add_service_to_customer(service.dict())

@app.get("/products", dependencies=[Depends(get_current_user)])
def read_products(): return db.get_products()

@app.post("/products", dependencies=[Depends(get_current_user)])
def create_product(product: Product): return db.add_product(product.dict())

@app.delete("/products/{product_name}", dependencies=[Depends(get_current_user)])
def delete_product(product_name: str): return db.delete_product(product_name)

@app.post("/invoices", dependencies=[Depends(get_current_user)])
def create_invoice(invoice: InvoiceCreate):
    new_inv = db.create_invoice(invoice.dict())
    if any(k in (invoice.Service or "").lower() for k in ["آنتی", "تمدید"]):
        db.renew_customer_antivirus(invoice.CustomerID)
    return new_inv

@app.get("/invoices/pending", dependencies=[Depends(get_current_user)])
def get_pending(): return db.get_invoices(status="در انتظار بررسی")

@app.put("/invoices/{invoice_id}/status", dependencies=[Depends(get_current_user)])
def update_inv(invoice_id: int, d: dict = Body(...)): return db.update_invoice(invoice_id, d.get("status"), d.get("license","-"))

@app.post("/upload-receipt/{invoice_id}")
async def upload_receipt(invoice_id: int, file: UploadFile = File(...)):
    os.makedirs("data/receipts", exist_ok=True)
    with open(f"data/receipts/{invoice_id}_{file.filename}", "wb+") as f: f.write(file.file.read())
    db.update_invoice(invoice_id, "در انتظار بررسی")
    return {"info": "saved"}

@app.get("/sms/config", dependencies=[Depends(get_current_user)])
def get_sms(): return db.get_sms_config()

@app.post("/sms/config", dependencies=[Depends(get_current_user)])
def save_sms(c: dict = Body(...)): return db.save_sms_config(c)

@app.post("/sms/send", dependencies=[Depends(get_current_user)])
def send_sms(p: dict = Body(...)): return {"status": "mock_sent"} # برای سادگی فعلا ماک

@app.get("/reminders/rules", dependencies=[Depends(get_current_user)])
def get_rules(): return db.get_reminder_rules()

@app.post("/reminders/rules", dependencies=[Depends(get_current_user)])
def save_rules(r: list[ReminderRule]): return db.save_reminder_rules([x.dict() for x in r])

@app.post("/reminders/check", dependencies=[Depends(get_current_user)])
def check_reminders(p: dict = Body(...)): return db.check_reminders(p.get('check_expired',True), p.get('range_mode',False))

@app.get("/dashboard-stats", dependencies=[Depends(get_current_user)])
def stats(): return db.get_dashboard_stats()

@app.get("/logs", dependencies=[Depends(get_current_user)])
def logs(): return db.get_audit_logs()

@app.get("/my-services")
def my_srv(u: dict = Depends(get_current_user)): return db.get_customer_by_phone(u['username'])

@app.get("/my-invoices")
def my_inv(u: dict = Depends(get_current_user)): 
    phone = str(u['username']).strip()
    return [i for i in db.get_invoices() if str(i.get('Phone','')).strip() == phone]

@app.get("/backup/config", dependencies=[Depends(get_current_user)])
def bk_conf(u: dict = Depends(get_current_user)): return get_config()

@app.post("/backup/config", dependencies=[Depends(get_current_user)])
def set_bk(c: dict = Body(...), u: dict = Depends(get_current_user)):
    conf = get_config(); conf.update(c); save_config(conf); return conf

@app.post("/backup/run", dependencies=[Depends(get_current_user)])
def run_bk(u: dict = Depends(get_current_user)): return {"file": create_backup_file()}

@app.get("/backup/list", dependencies=[Depends(get_current_user)])
def list_bk(u: dict = Depends(get_current_user)):
    if not os.path.exists(BACKUP_DIR): return []
    return [f for f in os.listdir(BACKUP_DIR) if f.endswith('.zip')]

@app.get("/backup/download/{filename}")
def dl_bk(filename: str):
    p = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(p): return FileResponse(p)
    raise HTTPException(404)

@app.get("/")
def root(): return {"message": "CRM Running"}