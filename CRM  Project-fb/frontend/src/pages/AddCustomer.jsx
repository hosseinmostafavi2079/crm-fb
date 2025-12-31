import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { UserPlus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', device: '', serial: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/customers/', form);
      toast.success("مشتری با موفقیت ثبت شد");
      navigate('/admin/customers');
    } catch (err) {
      toast.error(err.response?.data?.phone ? "این شماره قبلا ثبت شده است" : "خطا در ثبت مشتری");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-blue-600"/> ثبت مشتری جدید
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">نام و نام خانوادگی *</label>
                    <input required className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">شماره موبایل *</label>
                    <input required type="tel" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500 font-mono text-left" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">نوع دستگاه</label>
                    <input className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500" placeholder="مثلا: لپتاپ Asus" value={form.device} onChange={e=>setForm({...form, device: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">شماره سریال / مدل</label>
                    <input className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500 font-mono" value={form.serial} onChange={e=>setForm({...form, serial: e.target.value})} />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">توضیحات تکمیلی</label>
                <textarea className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:border-blue-500 h-24" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})}></textarea>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                {loading ? 'در حال ثبت...' : <><Save size={20}/> ذخیره اطلاعات</>}
            </button>
        </form>
      </div>
    </div>
  );
}