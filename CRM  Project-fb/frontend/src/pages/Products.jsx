import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Trash2, Plus, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', days_condition: 0, keyword: '' });
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products/');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return toast.error("نام و قیمت الزامی است");
    
    setLoading(true);
    try {
      await api.post('/api/products/', formData);
      toast.success("محصول ذخیره شد");
      setFormData({ name: '', price: '', days_condition: 0, keyword: '' });
      fetchProducts();
    } catch (err) { toast.error("خطا در ثبت محصول"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (confirm("آیا حذف شود؟")) {
      try {
        await api.delete(`/api/products/${id}/`);
        fetchProducts();
        toast.success("حذف شد");
      } catch (err) { toast.error("خطا در حذف"); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
         <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Package size={24}/></div>
         <h1 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* فرم */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
            <Plus size={18}/> محصول جدید
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام محصول</label>
              <input type="text" className="input-field w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">قیمت (تومان)</label>
              <input type="number" className="input-field w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">کلیدواژه (تشخیص خودکار)</label>
               <input type="text" placeholder="مثلا: antivirus" className="input-field w-full border rounded-lg p-2 font-mono text-left" value={formData.keyword} onChange={e => setFormData({...formData, keyword: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition">
              {loading ? '...' : 'ثبت محصول'}
            </button>
          </form>
        </div>

        {/* لیست */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-4">نام</th>
                <th className="p-4">قیمت</th>
                <th className="p-4">کلیدواژه</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-700">{p.name}</td>
                  <td className="p-4 text-gray-500">{Number(p.price).toLocaleString()}</td>
                  <td className="p-4 text-xs text-gray-400 font-mono">{p.keyword || '-'}</td>
                  <td className="p-4 text-left">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 transition p-2">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="p-8 text-center text-gray-400">لیست خالی است</div>}
        </div>
      </div>
    </div>
  );
}