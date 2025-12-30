import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShieldAlert, Download } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/logs').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="text-gray-700" size={28}/>
        <h1 className="text-2xl font-bold text-gray-800">گزارشات امنیتی و فعالیت‌ها</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right text-sm">
            <thead className="bg-gray-100 border-b">
                <tr>
                    <th className="p-4">زمان</th>
                    <th className="p-4">کاربر</th>
                    <th className="p-4">عملیات</th>
                    <th className="p-4">جزئیات</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500" dir="ltr">{log.Time}</td>
                        <td className="p-4 font-bold">{log.User}</td>
                        <td className="p-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{log.Action}</span>
                        </td>
                        <td className="p-4 text-gray-600">{log.Details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {logs.length === 0 && <div className="p-8 text-center text-gray-400">لاگی ثبت نشده است.</div>}
      </div>
    </div>
  );
}