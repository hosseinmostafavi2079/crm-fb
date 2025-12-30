import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingCart, RefreshCw, Search, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('new'); // tabs: 'new', 'list', 'receipts'
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // فرم سفارش
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [orderType, setOrderType] = useState('new'); // 'new' (جدید) or 'renew' (تمدید)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCust, resProd, resInv] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/invoices/pending') // یا همه فاکتورها بسته به نیاز
      ]);
      setCustomers(Array.isArray(resCust.data) ? resCust.data : []);
      setProducts(Array.isArray(resProd.data) ? resProd.data : []);
      setInvoices(Array.isArray(resInv.data) ? resInv.data : []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  // جستجوی ترکیبی (نام یا شماره)
  const filteredCustomers = customers.filter(c => 
    (c.Name && c.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.Phone && c.Phone.includes(searchTerm))
  );

  const handleSelectCustomer = (cust) => {
    setSelectedCust(cust);
    setSearchTerm(cust.Name); // نمایش نام در اینپوت
    // اگر تمدید باشد، می‌توانیم سرویس فعلی‌اش را پیش‌فرض کنیم (اختیاری)
  };

  const handleProductChange = (e) => {
    const pName = e.target.value;
    setSelectedProduct(pName);
    const prod = products.find(p => p.name === pName);
    if (prod) setPrice(prod.price);
  };

  const handleSubmitOrder = async () => {
    if (!selectedCust || !selectedProduct) return toast.error("مشتری و محصول را انتخاب کنید");

    try {
      // 1. ثبت فاکتور
      await api.post('/invoices', {
        CustomerID: selectedCust.CustomerID,
        CustomerName: selectedCust.Name,
        Phone: selectedCust.Phone,
        Service: selectedProduct + (orderType === 'renew' ? ' (تمدید)' : ''),
        Amount: parseInt(price),
        Notes: note // اگر بکند ساپورت کند
      });

      // 2. اگر تمدید است، تاریخ‌های مشتری هم آپدیت شود (اختیاری - نیاز به API جدا دارد)
      // فعلا فقط فاکتور صادر می‌کنیم که روال استاندارد است.

      toast.success("سفارش با موفقیت ثبت شد");
      // ریست فرم
      setSelectedCust(null); setSearchTerm(''); setSelectedProduct(''); setPrice(0);
      fetchData(); // بروزرسانی لیست‌ها
    } catch (err) { toast.error("خطا در ثبت سفارش"); }
  };

  const handleApproveInvoice = async (id, status) => {
    try {
        const license = status === 'تایید شده' ? prompt("کد لایسنس (اختیاری):") || '-' : '-';
        await api.put(`/invoices/${id}/status`, { status, license });
        toast.success(`وضعیت تغییر کرد: ${status}`);
        fetchData();
    } catch(err) { toast.error("خطا در تغییر وضعیت"); }
  }

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="text-blue-600" size={32}/>
        <h1 className="text-2xl font-bold text-gray-800">مدیریت سفارشات و مالی</h1>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('new')} className={`pb-2 px-4 font-bold ${activeTab === 'new' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            ثبت سفارش / تمدید
        </button>
        <button onClick={() => setActiveTab('receipts')} className={`pb-2 px-4 font-bold ${activeTab === 'receipts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            بررسی فیش‌ها <span className="bg-red-100 text-red-600 px-2 rounded-full text-xs">{invoices.length}</span>
        </button>
      </div>

      {/* محتوای تب 1: ثبت سفارش */}
      {activeTab === 'new' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ستون راست: انتخاب مشتری */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">۱. جستجوی مشتری (نام یا شماره)</label>
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500"
                        placeholder="مثلاً: علی یا 0912..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                </div>
                
                {/* لیست پیشنهادی */}
                {searchTerm && !selectedCust && (
                    <div className="mt-2 border rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg absolute z-10 w-full md:w-auto">
                        {filteredCustomers.map(c => (
                            <div key={c.CustomerID} 
                                onClick={() => handleSelectCustomer(c)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                            >
                                <span className="font-bold text-sm">{c.Name}</span>
                                <span className="text-xs text-gray-500 dir-ltr">{c.Phone}</span>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && <div className="p-3 text-gray-400 text-sm">موردی یافت نشد</div>}
                    </div>
                )}

                {selectedCust && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-blue-800">{selectedCust.Name}</p>
                            <p className="text-sm text-blue-600">{selectedCust.Phone}</p>
                            <p className="text-xs text-gray-500 mt-1">دستگاه: {selectedCust.Device} | آنتی‌ویروس: {selectedCust.Antivirus}</p>
                        </div>
                        <button onClick={() => {setSelectedCust(null); setSearchTerm('')}} className="text-red-500 text-sm hover:underline">تغییر</button>
                    </div>
                )}
            </div>

            {/* ستون چپ: جزئیات سفارش */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">۲. مشخصات سفارش</label>
                
                {/* انتخاب نوع عملیات */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setOrderType('new')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition ${orderType === 'new' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        <Plus size={16} className="inline ml-1"/> سرویس جدید
                    </button>
                    <button 
                        onClick={() => setOrderType('renew')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition ${orderType === 'renew' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                    >
                        <RefreshCw size={16} className="inline ml-1"/> تمدید سرویس
                    </button>
                </div>

                <select 
                    className="w-full p-3 border rounded-xl outline-none focus:border-blue-500"
                    value={selectedProduct}
                    onChange={handleProductChange}
                >
                    <option value="">انتخاب محصول / سرویس...</option>
                    {products.map((p, idx) => (
                        <option key={idx} value={p.name}>{p.name}</option>
                    ))}
                </select>

                <div className="relative">
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 pl-12"
                        placeholder="مبلغ (تومان)"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400 text-sm">تومان</span>
                </div>

                <textarea 
                    className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="توضیحات تکمیلی (اختیاری)..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                ></textarea>

                <button 
                    onClick={handleSubmitOrder}
                    disabled={!selectedCust || !selectedProduct}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition flex justify-center items-center gap-2
                        ${selectedCust && selectedProduct ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    <FileText size={20}/> ثبت نهایی
                </button>
            </div>
        </div>
      )}

      {/* محتوای تب 2: بررسی فیش‌ها */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 text-sm text-gray-600">مشتری</th>
                        <th className="p-4 text-sm text-gray-600">سرویس</th>
                        <th className="p-4 text-sm text-gray-600">مبلغ</th>
                        <th className="p-4 text-sm text-gray-600">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {invoices.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400">فیشی برای بررسی وجود ندارد</td></tr>
                    ) : invoices.map(inv => (
                        <tr key={inv.InvoiceID} className="hover:bg-gray-50">
                            <td className="p-4">
                                <p className="font-bold">{inv.CustomerName}</p>
                                <p className="text-xs text-gray-500">{inv.Phone}</p>
                            </td>
                            <td className="p-4 text-sm">{inv.Service}</td>
                            <td className="p-4 font-mono text-blue-600">{parseInt(inv.Amount).toLocaleString()}</td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => handleApproveInvoice(inv.InvoiceID, 'تایید شده')} className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-100 transition" title="تایید">
                                    <CheckCircle size={18}/>
                                </button>
                                <button onClick={() => handleApproveInvoice(inv.InvoiceID, 'رد شده')} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition" title="رد">
                                    <Clock size={18}/> {/* آیکون رد کردن */}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}