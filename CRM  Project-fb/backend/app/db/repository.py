import pandas as pd
import os
import jdatetime
import json
import io

# مسیر فایل‌ها
DATA_DIR = "data"
DB_FILE = os.path.join(DATA_DIR, "customers.xlsx")
PAYMENTS_FILE = os.path.join(DATA_DIR, "payments.xlsx")
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
SMS_CONFIG_FILE = os.path.join(DATA_DIR, "sms_config.json")
AUDIT_FILE = "audit_log.csv"

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

class ExcelDB:
    def __init__(self):
        self._init_files()

    def _init_files(self):
        # فایل مشتریان
        if not os.path.exists(DB_FILE):
            pd.DataFrame(columns=['CustomerID', 'Name', 'Phone', 'Device', 'Model', 'Serial', 
                                  'WarrantyDate', 'Antivirus', 'AntivirusDate', 'BuyDate', 'Notes']).to_excel(DB_FILE, index=False)
        # فایل فاکتورها
        if not os.path.exists(PAYMENTS_FILE):
            pd.DataFrame(columns=['InvoiceID', 'CustomerID', 'CustomerName', 'Phone', 
                                  'Service', 'Amount', 'Date', 'Status', 'ReceiptPath', 'LicenseCode']).to_excel(PAYMENTS_FILE, index=False)
        # فایل محصولات
        if not os.path.exists(PRODUCTS_FILE):
            default_prods = [
                {"name": "تمدید آنتی‌ویروس تک کاربره", "price": 100000, "days_condition": 30, "keyword": "nod"},
                {"name": "تمدید آنتی‌ویروس دو کاربره", "price": 200000, "days_condition": 30, "keyword": "nod"}
            ]
            with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(default_prods, f, ensure_ascii=False, indent=4)

    # --- متدهای کمکی ---
    def _get_next_id(self, df):
        if df.empty or 'CustomerID' not in df.columns: return 1000
        try: return int(df['CustomerID'].max()) + 1
        except: return 1000

    def _normalize_phone(self, phone):
        p = str(phone).strip()
        if p.startswith('0'): return p[1:]
        return p

    # --- مشتریان ---
    def get_all_customers(self):
        df = pd.read_excel(DB_FILE)
        df = df.astype(str).replace("nan", "-").replace("None", "-")
        return df.to_dict(orient="records")

    def get_customer_by_phone(self, phone: str):
        df = pd.read_excel(DB_FILE)
        df['Phone'] = df['Phone'].astype(str)
        clean_phone = self._normalize_phone(phone)
        found = df[df['Phone'].apply(self._normalize_phone) == clean_phone]
        found = found.astype(str).replace("nan", "-").replace("None", "-")
        return found.to_dict(orient="records")

    def add_customer(self, data: dict):
        df = pd.read_excel(DB_FILE)
        
        # چک کنیم اگر این مشتری قبلاً بوده، همان ID را استفاده کنیم
        clean_p = self._normalize_phone(data['Phone'])
        existing = df[df['Phone'].astype(str).apply(self._normalize_phone) == clean_p]
        
        if not existing.empty:
            # مشتری قدیمی است، شناسه او را برمی‌داریم
            data['CustomerID'] = existing.iloc[0]['CustomerID']
        else:
            # مشتری جدید است، شناسه جدید می‌سازیم
            data['CustomerID'] = self._get_next_id(df)

        if not data.get('BuyDate') or data.get('BuyDate') == "-":
             data['BuyDate'] = jdatetime.date.today().strftime("%Y/%m/%d")
        
        new_df = pd.concat([df, pd.DataFrame([data])], ignore_index=True)
        new_df.to_excel(DB_FILE, index=False)
        return data

    def delete_customer(self, customer_id: int):
        # این متد فقط یک ردیف خاص را پاک می‌کند
        df = pd.read_excel(DB_FILE)
        # ما اینجا فرض می‌کنیم حذف بر اساس ID یعنی حذف کل سوابق آن شخص
        # اگر می‌خواهید فقط یک ردیف حذف شود باید منطق دیگری داشته باشد
        df = df[df['CustomerID'] != int(customer_id)]
        df.to_excel(DB_FILE, index=False)
        return True

    # *** ویژگی جدید: حذف کل دیتابیس (Reset) ***
    def delete_all_customers(self):
        # ساخت مجدد فایل خالی با هدرها
        pd.DataFrame(columns=['CustomerID', 'Name', 'Phone', 'Device', 'Model', 'Serial', 
                              'WarrantyDate', 'Antivirus', 'AntivirusDate', 'BuyDate', 'Notes']).to_excel(DB_FILE, index=False)
        return True

    # *** اصلاح شده: ایمپورت اکسل (نگه داشتن تمام سوابق) ***
    def import_customers(self, file_bytes):
        try:
            raw_data = pd.read_excel(io.BytesIO(file_bytes))
            df_current = pd.read_excel(DB_FILE)
            next_id = self._get_next_id(df_current)
            
            # نگاشت شماره موبایل -> شناسه مشتری
            # این دیکشنری کمک می‌کند اگر شماره تکراری در فایل بود، همان ID قبلی را بگیرد
            existing_phones = {}
            
            # ۱. پر کردن دیکشنری با مشتریان فعلی دیتابیس
            for idx, row in df_current.iterrows():
                p = self._normalize_phone(row['Phone'])
                if len(p) > 5: existing_phones[p] = row['CustomerID']

            new_records = []
            
            for _, row in raw_data.iterrows():
                # تمیزکاری شماره
                phone_raw = row.get('موبایل', row.get('Phone', '-'))
                if pd.notna(phone_raw) and str(phone_raw).replace('.','').isdigit():
                    phone = str(int(float(phone_raw)))
                else:
                    phone = str(phone_raw).strip()
                
                if phone == "nan" or phone == "": phone = "-"
                
                name = row.get('نام و نام خانوادگی', row.get('Name', 'بدون نام'))
                if pd.isna(name): name = "بدون نام"

                # تعیین ID: آیا مشتری قدیمی است یا جدید؟
                norm_p = self._normalize_phone(phone)
                
                current_cid = next_id # پیش‌فرض: مشتری جدید
                
                if norm_p in existing_phones:
                    # مشتری تکراری است -> استفاده از ID موجود
                    current_cid = existing_phones[norm_p]
                else:
                    # مشتری کاملاً جدید است -> استفاده از next_id و افزایش آن
                    if len(norm_p) > 5: # فقط اگر شماره معتبر بود ذخیره کن
                        existing_phones[norm_p] = next_id
                    next_id += 1

                # ساخت رکورد
                new_rec = {
                    'CustomerID': current_cid, # اینجا کلید ماجراست! همه خریدها یک ID می‌گیرند
                    'Name': name,
                    'Phone': phone,
                    'Device': row.get('دستگاه', row.get('Device', '-')),
                    'Model': row.get('مدل', row.get('Model', '-')),
                    'Serial': row.get('سریال', row.get('Serial', '-')),
                    'WarrantyDate': row.get('تاریخ گارانتی', row.get('WarrantyDate', '-')),
                    'Antivirus': row.get('انتی ویروس', row.get('Antivirus', '-')),
                    'AntivirusDate': "-",
                    'BuyDate': row.get('تاریخ خروج', row.get('BuyDate', '-')),
                    'Notes': str(row.get('توضیحات', row.get('Notes', '-')))
                }
                
                # محاسبه تاریخ آنتی ویروس
                if new_rec['Antivirus'] != "-" and new_rec['BuyDate'] != "-":
                     try:
                        y, m, d = map(int, str(new_rec['BuyDate']).split('/'))
                        new_rec['AntivirusDate'] = f"{y+1}/{m:02d}/{d:02d}"
                     except: pass
                     
                new_records.append(new_rec)
            
            if new_records:
                final_df = pd.concat([df_current, pd.DataFrame(new_records)], ignore_index=True)
                
                # *** تغییر مهم: حذف duplicate فقط در صورتی که تمام فیلدها دقیقاً یکی باشند ***
                # قبلاً روی subset=['CustomerID'] بود که باعث می‌شد خریدهای دوم و سوم حذف شوند.
                # الان اگر شخصی ۱۰ تا خرید متفاوت داشته باشد، هر ۱۰ تا می‌مانند.
                final_df = final_df.drop_duplicates(subset=['CustomerID', 'Device', 'Serial', 'Antivirus', 'BuyDate'], keep='last')
                
                final_df.to_excel(DB_FILE, index=False)
                return {"status": "success", "count": len(new_records)}
            
            return {"status": "empty", "count": 0}

        except Exception as e:
            return {"status": "error", "message": str(e)}

    # --- پاکسازی شماره‌های خراب (بدون حذف سوابق معتبر) ---
    def clean_database(self):
        df = pd.read_excel(DB_FILE)
        old_count = len(df)
        df['Phone'] = df['Phone'].astype(str).apply(self._normalize_phone)
        df = df[df['Phone'].apply(lambda x: len(str(x)) > 5 and str(x) != 'nan')]
        df.to_excel(DB_FILE, index=False)
        return {"removed": old_count - len(df)}

    # ... (بقیه کدهای products, invoices, sms, logs بدون تغییر بمانند)
    # --- محصولات ---
    def get_products(self):
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f: return json.load(f)
        return []
    def add_product(self, product: dict):
        prods = self.get_products(); prods.append(product)
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f: json.dump(prods, f, ensure_ascii=False, indent=4)
        return product
    def delete_product(self, product_name: str):
        prods = self.get_products(); new_prods = [p for p in prods if p['name'] != product_name]
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f: json.dump(new_prods, f, ensure_ascii=False, indent=4)
        return True
    def create_invoice(self, data: dict):
        df = pd.read_excel(PAYMENTS_FILE)
        data['InvoiceID'] = int(pd.Timestamp.now().timestamp()); data['Date'] = jdatetime.datetime.now().strftime("%Y/%m/%d %H:%M"); data['Status'] = "پرداخت نشده"; data['ReceiptPath'] = "-"; data['LicenseCode'] = "-"
        new_df = pd.concat([df, pd.DataFrame([data])], ignore_index=True); new_df.to_excel(PAYMENTS_FILE, index=False)
        return data
    def get_invoices(self, status=None):
        df = pd.read_excel(PAYMENTS_FILE).fillna("-")
        if status: df = df[df['Status'] == status]
        return df.to_dict(orient="records")
    def update_invoice(self, invoice_id: int, status: str, license_code: str = "-"):
        df = pd.read_excel(PAYMENTS_FILE)
        idx = df[df['InvoiceID'] == invoice_id].index
        if not idx.empty:
            df.at[idx[0], 'Status'] = status
            if license_code != "-": df.at[idx[0], 'LicenseCode'] = license_code
            df.to_excel(PAYMENTS_FILE, index=False); return True
        return False
    def get_sms_config(self):
        if os.path.exists(SMS_CONFIG_FILE):
            with open(SMS_CONFIG_FILE, 'r') as f: return json.load(f)
        return {"api_key": "", "sender": ""}
    def save_sms_config(self, config: dict):
        with open(SMS_CONFIG_FILE, 'w') as f: json.dump(config, f)
        return config
    def get_reminder_rules(self):
        CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f: return json.load(f).get('rules', [])
        return []
    def save_reminder_rules(self, rules: list):
        CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
        current_conf = {}
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f: current_conf = json.load(f)
        current_conf['rules'] = rules
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f: json.dump(current_conf, f, ensure_ascii=False, indent=4)
        return rules
    def check_reminders(self, check_expired=True, range_mode=False):
        df = pd.read_excel(DB_FILE).fillna("-")
        rules = self.get_reminder_rules(); today = jdatetime.date.today(); alerts = []
        for _, row in df.iterrows():
            av_date = str(row.get('AntivirusDate', '-'))
            if av_date not in ['-', 'nan', '']:
                try:
                    y, m, d = map(int, av_date.split('/'))
                    tgt = jdatetime.date(y, m, d); days_left = (tgt - today).days
                    for rule in rules:
                        if rule['type'] == 'antivirus':
                            is_match = (0 <= days_left <= rule['days']) if range_mode else (days_left == rule['days'])
                            if is_match:
                                msg = rule['msg'].format(name=row['Name'], antivirus=row['Antivirus'], days=days_left)
                                alerts.append({"Name": row['Name'], "Phone": row['Phone'], "Type": "آنتی‌ویروس", "Subject": f"{days_left} روز مانده", "Message": msg})
                    if check_expired and days_left < 0: alerts.append({"Name": row['Name'], "Phone": row['Phone'], "Type": "منقضی", "Subject": "اتمام", "Message": f"مشترک گرامی {row['Name']}، سرویس شما منقضی شده است."})
                except: pass
        seen = set(); unique = []
        for a in alerts:
            k = f"{a['Phone']}_{a['Message']}"
            if k not in seen: seen.add(k); unique.append(a)
        return unique
    def add_service_to_customer(self, data: dict):
        df = pd.read_excel(DB_FILE)
        parent = df[df['CustomerID'] == data['CustomerID']].iloc[0]
        new_record = data.copy()
        new_record.update({'Name': parent['Name'], 'Phone': parent['Phone'], 'BuyDate': jdatetime.date.today().strftime("%Y/%m/%d")})
        new_df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
        new_df.to_excel(DB_FILE, index=False)
        return new_record
    def get_dashboard_stats(self):
        df = pd.read_excel(DB_FILE).fillna("-")
        active = df[ (df['Device']!='-') | (df['Antivirus']!='-') ]
        expired=0; warning=0; safe=0; today=jdatetime.date.today()
        for _, row in active.iterrows():
            try:
                y,m,d = map(int, str(row.get('AntivirusDate','')).split('/'))
                days = (jdatetime.date(y,m,d) - today).days
                if days<0: expired+=1
                elif days<30: warning+=1
                else: safe+=1
            except: pass
        return {"total_customers": len(df), "total_active": len(active), "safe": safe, "warning": warning, "expired": expired}
    def get_audit_logs(self):
        if os.path.exists(AUDIT_FILE):
            try: return pd.read_csv(AUDIT_FILE).fillna("-").to_dict(orient="records")
            except: return []
        return []

    def renew_customer_antivirus(self, customer_id):
        import jdatetime
        from openpyxl import load_workbook
        
        try:
            wb = load_workbook(self.customers_file)
            ws = wb.active
            
            # پیدا کردن ستون‌ها
            headers = {cell.value: i for i, cell in enumerate(ws[1])}
            id_col = headers.get('CustomerID')
            antivirus_date_col = headers.get('AntivirusDate')
            
            if id_col is None or antivirus_date_col is None:
                return False

            # پیدا کردن مشتری و آپدیت تاریخ
            for row in ws.iter_rows(min_row=2):
                if str(row[id_col].value) == str(customer_id):
                    # محاسبه تاریخ سال بعد
                    next_year = jdatetime.date.today() + jdatetime.timedelta(days=365)
                    new_date = next_year.strftime("%Y/%m/%d")
                    
                    # ثبت در اکسل
                    row[antivirus_date_col].value = new_date
                    wb.save(self.customers_file)
                    return new_date
            return False
        except Exception as e:
            print(f"Error updating excel: {e}")
            return False

db = ExcelDB()