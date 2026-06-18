import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Minus } from 'lucide-react';

const statusIcon = (s: string) => {
  if (s === 'PRESENT') return <CheckCircle size={16} className="text-emerald-500" />;
  if (s === 'ABSENT') return <XCircle size={16} className="text-red-400" />;
  return <Minus size={16} className="text-blue-400" />;
};

const statusColor = (s: string) => {
  if (s === 'PRESENT') return 'bg-emerald-50 border-emerald-200';
  if (s === 'ABSENT') return 'bg-red-50 border-red-200';
  return 'bg-blue-50 border-blue-200';
};

export default function AttendanceCompliance() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data: internData } = useQuery({
    queryKey: ['intern-for-attendance', user?.email],
    queryFn: () => api.get('/interns').then((r) => {
      const all = r.data.data;
      return all.find((i: any) => i.email === user?.email) || null;
    }),
    enabled: id === 'me',
  });

  const internId = id === 'me' ? internData?._id : id;

  const { data: compliance } = useQuery({
    queryKey: ['compliance', internId],
    queryFn: () => api.get(`/attendance/compliance/${internId}`).then((r) => r.data.data),
    enabled: !!internId,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', internId],
    queryFn: () => api.get(`/attendance/intern/${internId}`).then((r) => r.data.data),
    enabled: !!internId,
  });

  const records: any[] = attendanceData || [];

  if (!internId && id === 'me') return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
      <p className="text-gray-500 text-sm">Your intern profile hasn't been created yet.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance & Compliance</h1>
        <p className="text-sm text-gray-500">Daily standup presence tracking</p>
      </div>

      {compliance && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Compliance Score</span>
            <span className="text-3xl font-bold text-reliance-blue">{compliance.compliance}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                compliance.compliance >= 90 ? 'bg-emerald-500' :
                compliance.compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${compliance.compliance}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">{compliance.submitted}</p>
              <p className="text-emerald-600 text-xs mt-0.5">Standups submitted</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-700">{compliance.expected}</p>
              <p className="text-gray-500 text-xs mt-0.5">Expected working days</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Attendance Log</h2>
        </div>
        {!records.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No attendance records yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r: any) => (
              <div key={r._id} className={`flex items-center gap-3 px-5 py-3 border-l-4 ${statusColor(r.status)}`}>
                {statusIcon(r.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{format(new Date(r.date), 'EEEE, dd MMM yyyy')}</p>
                  <p className="text-xs text-gray-400">{r.source}</p>
                </div>
                <span className={`badge text-xs ${
                  r.status === 'PRESENT' ? 'badge-green' :
                  r.status === 'ABSENT' ? 'badge-red' : 'badge-blue'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
