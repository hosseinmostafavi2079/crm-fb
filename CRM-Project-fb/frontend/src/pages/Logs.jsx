import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Shield } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
      api.get('/api/logs/').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield/> گزارشات امنیتی</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-500">
                  <tr><th className="p-4">کاربر</th><th className="p-4">عملیات</th><th className="p-4">زمان</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                          <td className="p-4 font-bold">{log.username || 'System'}</td>
                          <td className="p-4">{log.action} - <span className="text-gray-400 text-xs">{log.details}</span></td>
                          <td className="p-4 dir-ltr text-gray-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString('fa-IR')}</td>
                      </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400">گزارشی ثبت نشده است</td></tr>}
              </tbody>
          </table>
      </div>
    </div>
  );
}