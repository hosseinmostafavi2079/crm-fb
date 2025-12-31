import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingCart, Search, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('new'); 
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // States Form
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [selectedProd, setSelectedProd] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('paid');

  useEffect(() => {
    const init = async () => {
        try {
            const [c, p, i] = await Promise.all([
                api.get('/api/customers/'),
                api.get('/api/products/'),
                api.get('/api/invoices/')
            ]);
            setCustomers(c.data);
            setProducts(p.data);
            setInvoices(i.data);
        } catch(e) { console.error(e); }
    };
    init();
  }, []);

  const handleProductSelect = (e) => {
      const prodName = e.target.value;
      setSelectedProd(prodName);
      const prod = products.find(p => p.name === prodName);
      if(prod) setPrice(prod.price);
  };

  const handleSubmit = async () => {
      if(!selectedCust || !selectedProd) return toast.error("مشتری و محصول الزامی است");
      
      try {
          await api.post('/api/invoices/', {
              customer: selectedCust.id,
              service_name: selectedProd,
              amount: price,
              status: status
          });
          toast.success("سفارش ثبت شد");
          // رفرش لیست
          const res = await api.get('/api/invoices/');
          setInvoices(res.data);
          setSelectedCust(null); setSearch('');
      } catch(e) { toast.error("خطا در ثبت سفارش"); }
  }

  // فیلتر مشتریان برای سرچ
  const filteredCust = customers.filter(c => c.name?.includes(search) || c.phone?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
         <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ShoppingCart size={24}/></div>
         <h1 className="text-2xl font-bold text-gray-800">سفارشات</h1>
      </div>

      <div className="flex gap-4 border-b">
        <button onClick={()=>setActiveTab('new')} className={`pb-2 px-4 font-bold ${activeTab==='new' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>ثبت سفارش</button>
        <button onClick={()=>setActiveTab('list')} className={`pb-2 px-4 font-bold ${activeTab==='list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>لیست فاکتورها</button>
      </div>

      {activeTab === 'new' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              {/* انتخاب مشتری */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">۱. انتخاب مشتری</label>
                  <div className="relative mb-2">
                      <input type="text" placeholder="جستجو نام یا موبایل..." className="w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white transition" value={search} onChange={e=>setSearch(e.target.value)} />
                      <Search className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                  </div>
                  {search && !selectedCust && (
                      <div className="border rounded-xl max-h-48 overflow-y-auto">
                          {filteredCust.map(c => (
                              <div key={c.id} onClick={()=>{setSelectedCust(c); setSearch(c.name)}} className="p-3 hover:bg-blue-50 cursor-pointer border-b text-sm flex justify-between">
                                  <span>{c.name}</span> <span className="text-gray-500 font-mono">{c.phone}</span>
                              </div>
                          ))}
                      </div>
                  )}
                  {selectedCust && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-bold mt-2">مشتری انتخاب شد: {selectedCust.name}</div>}
              </div>

              {/* فرم سفارش */}
              <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">۲. جزئیات</label>
                  <select className="w-full p-3 border rounded-xl" onChange={handleProductSelect} value={selectedProd}>
                      <option value="">انتخاب محصول...</option>
                      {products.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <input type="number" placeholder="مبلغ (تومان)" className="w-full p-3 border rounded-xl" value={price} onChange={e=>setPrice(e.target.value)} />
                  <select className="w-full p-3 border rounded-xl" value={status} onChange={e=>setStatus(e.target.value)}>
                      <option value="paid">پرداخت شده</option>
                      <option value="unpaid">پرداخت نشده</option>
                  </select>
                  <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">ثبت فاکتور</button>
              </div>
          </div>
      )}

      {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">مشتری</th><th className="p-4">سرویس</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                      {invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                              <td className="p-4 font-bold">{inv.customer_name}</td>
                              <td className="p-4">{inv.service_name}</td>
                              <td className="p-4">{Number(inv.amount).toLocaleString()}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs ${inv.status==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                                      {inv.status === 'paid' ? 'پرداخت شده' : 'معلق'}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              </div>
          </div>
      )}
    </div>
  );
}