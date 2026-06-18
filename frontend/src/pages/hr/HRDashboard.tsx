import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, UserPlus, Activity, CheckCircle, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../router/routeConfig';

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: 'badge badge-amber',
  ACTIVE: 'badge badge-green',
  COMPLETED: 'badge badge-blue',
  TERMINATED: 'badge badge-red',
};

export default function HRDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: () => api.get('/dashboard/hr').then((r) => r.data.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => navigate('/audit')} className="btn-outline">
            <ShieldCheck size={16} /> <span className="hidden sm:inline">Audit Log</span>
          </button>
          <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)} className="btn-primary">
            <UserPlus size={16} /> <span className="hidden sm:inline">Create Intern</span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-reliance-blue to-blue-600 text-white p-4 md:p-6 shadow-lg flex gap-4 md:gap-8 flex-wrap">
        {[
          { label: 'Total Interns', value: d.total ?? 0 },
          { label: 'Active', value: d.active ?? 0 },
          { label: 'Onboarding', value: d.onboarding ?? 0 },
          { label: 'Completed', value: d.completed ?? 0 },
          { label: 'Reviews Pending', value: d.reviewsPending ?? 0 },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-white/70 text-sm">{label}</p>
            <p className="text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Interns', value: d.total ?? 0, icon: <Users size={20} className="text-white" />, bg: 'bg-blue-500' },
          { label: 'Active', value: d.active ?? 0, icon: <Activity size={20} className="text-white" />, bg: 'bg-emerald-500' },
          { label: 'Onboarding', value: d.onboarding ?? 0, icon: <Clock size={20} className="text-white" />, bg: 'bg-amber-500' },
          { label: 'Completed', value: d.completed ?? 0, icon: <CheckCircle size={20} className="text-white" />, bg: 'bg-purple-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Interns</h3>
          <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.INTERNS)}
            className="text-xs text-reliance-blue hover:underline font-medium flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>
        {!(d.recentInterns?.length) ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            No interns yet.{' '}
            <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)}
              className="text-reliance-blue font-medium hover:underline">Create one</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Start Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(d.recentInterns || []).map((intern: any) => (
                <tr key={intern._id}
                  onClick={() => navigate(`/interns/${intern._id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {intern.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{intern.name}</p>
                        <p className="text-xs text-gray-400">{intern.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{intern.employeeCode || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{intern.department || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {intern.startDate ? format(new Date(intern.startDate), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={STATUS_COLORS[intern.status] || 'badge badge-gray'}>{intern.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight size={14} className="text-gray-300 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
