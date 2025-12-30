import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Trash2, Plus, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [newProd, setNewProd] = useState({ name: '', price: '', days_condition: 0, keyword: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return toast.error("نام و قیمت الزامی است");
    try {
      await api.post('/products', newProd);
      toast.success("محصول اضافه شد");
      setNewProd({ name: '', price: '', days_condition: 0, keyword: '' });
      fetchProducts();
    } catch (err) { toast.error("خطا در ثبت"); }
  };

  const handleDelete = async (name) => {
    if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      await api.delete(`/products/${name}`);
      fetchProducts();
      toast.success("حذف شد");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-amber-600" /> تعریف محصولات
        </h1>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm border border-blue-100">
        محصولاتی که 'شرط روز' داشته باشند، در زمان صدور فاکتور یا پیامک، خودکار پیشنهاد می‌شوند.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* فرم افزودن */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
            <Plus size={18}/> افزودن / ویرایش محصول
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام محصول:</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:bg-white focus:border-blue-500 transition outline-none"
                value={newProd.name}
                onChange={e => setNewProd({...newProd, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">قیمت (تومان):</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2">
                <input 
                  type="number" 
                  className="w-full bg-transparent p-2 outline-none"
                  value={newProd.price}
                  onChange={e => setNewProd({...newProd, price: e.target.value})}
                />
                <span className="text-xs text-gray-400 pl-1">+</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-600 mb-2">
                <Settings size={14}/> تنظیمات نمایش هوشمند
              </div>
              <div className="space-y-3 pl-2 border-r-2 border-gray-100 mr-1">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">شرط روز (0 = همیشه):</label>
                    <input 
                        type="number" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                        value={newProd.days_condition}
                        onChange={e => setNewProd({...newProd, days_condition: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">فیلتر کلمه کلیدی (مثلاً nod):</label>
                    <input 
                        type="text" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                        value={newProd.keyword}
                        onChange={e => setNewProd({...newProd, keyword: e.target.value})}
                    />
                </div>
              </div>
            </div>

            <button className="w-full bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-bold py-2 rounded-lg transition mt-4">
              ذخیره محصول
            </button>
          </form>
        </div>

        {/* جدول لیست */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-4">نام</th>
                <th className="p-4">قیمت</th>
                <th className="p-4">شرط نمایش</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-700">{p.name}</td>
                  <td className="p-4 text-gray-500">{parseInt(p.price).toLocaleString()}</td>
                  <td className="p-4 text-xs text-gray-400">
                    {p.days_condition > 0 ? `اگر کمتر از ${p.days_condition} روز مانده` : 'همیشه'}
                    {p.keyword && ` (شامل '${p.keyword}')`}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(p.name)} className="text-red-400 hover:text-red-600 transition">
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