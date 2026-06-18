import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, TrendingUp, CheckCircle, AlertCircle, Clock, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../router/routeConfig';
import { useAuthStore } from '../../store/authStore';

const StatCard = ({ label, value, icon, color }: {
  label: string; value: number | string; icon: React.ReactNode; color: string;
}) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'badge-green', Pending: 'badge-amber', Completed: 'badge-blue', Withdrawn: 'badge-red'
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
};

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: () => api.get('/dashboard/manager').then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name} · {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)} className="btn-primary">
          <Plus size={16} /> Add Intern
        </button>
      </div>

      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-r from-reliance-blue to-blue-600 text-white p-6 flex items-center gap-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
          <Users size={32} className="text-white" />
        </div>
        <div>
          <p className="text-white/70 text-sm font-medium">Your Team</p>
          <p className="text-4xl font-black mt-1">{d.totalInterns ?? 0}</p>
          <p className="text-white/70 text-sm">Total Interns</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-white/70 text-xs">Active</p>
          <p className="text-3xl font-bold">{d.activeInterns ?? 0}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Interns" value={d.totalInterns ?? 0}
          icon={<Users size={22} className="text-white" />} color="bg-blue-500" />
        <StatCard label="Standups Submitted" value={d.standupCount ?? 0}
          icon={<Clock size={22} className="text-white" />} color="bg-purple-500" />
        <StatCard label="Milestones Done" value={d.milestonesCompleted ?? 0}
          icon={<CheckCircle size={22} className="text-white" />} color="bg-emerald-500" />
        <StatCard label="Milestones Overdue" value={d.milestonesOverdue ?? 0}
          icon={<AlertCircle size={22} className="text-white" />} color="bg-red-500" />
      </div>

      {/* Two-column */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent interns */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-reliance-blue" /> Recent Interns
            </h3>
            <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.INTERNS)}
              className="text-xs text-reliance-blue hover:underline font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {(d.recentInterns || []).length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No interns yet.{' '}
                <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)}
                  className="text-reliance-blue font-medium hover:underline">Add one</button>
              </div>
            ) : (
              (d.recentInterns || []).map((intern: any) => (
                <div key={intern._id}
                  onClick={() => navigate(`/interns/${intern._id}`)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {intern.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{intern.name}</p>
                    <p className="text-xs text-gray-400 truncate">{intern.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge(intern.status)}
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-reliance-blue" /> Next Actions
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Review pending standup replies', href: ROUTES.WORKSPACE.STANDARD.STANDUP_FEED, tag: 'Buddy', color: 'badge-blue' },
              { label: 'Assign mentors to new interns', href: ROUTES.WORKSPACE.STANDARD.MAP_MANAGER, tag: 'HR', color: 'badge-amber' },
              { label: 'Check overdue milestones', href: ROUTES.WORKSPACE.STANDARD.INTERNS, tag: 'Action', color: 'badge-red' },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100
                  hover:border-reliance-blue/30 hover:bg-blue-50/50 transition-all text-left group">
                <div className="w-2 h-2 rounded-full bg-reliance-blue flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span className="flex-1 text-sm text-gray-700">{action.label}</span>
                <span className={action.color}>{action.tag}</span>
              </button>
            ))}

            {/* Recent standups */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Standups</p>
              {(d.recentStandups || []).length === 0 ? (
                <p className="text-sm text-gray-400">No standups yet.</p>
              ) : (
                (d.recentStandups || []).map((s: any) => (
                  <div key={s._id} className="flex items-start gap-2.5 py-2 border-t border-gray-50">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center
                      text-purple-700 text-xs font-bold flex-shrink-0 mt-0.5">
                      {s.internId?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{s.internId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 truncate">{s.today}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {s.date ? format(new Date(s.date), 'dd MMM') : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
