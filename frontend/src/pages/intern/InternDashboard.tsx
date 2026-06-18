import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Flag, ClipboardList, CheckCircle, Clock, ChevronRight, AlertCircle, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ROUTES } from '../../router/routeConfig';
import { useAuthStore } from '../../store/authStore';

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <div
      className="h-full rounded-full bg-gradient-to-r from-reliance-blue to-emerald-500 transition-all duration-700"
      style={{ width: `${value}%` }}
    />
  </div>
);

const msStatusColor = (s: string) => ({
  'Completed': 'text-emerald-600', 'In Progress': 'text-blue-600',
  'Overdue': 'text-red-600', 'Not Started': 'text-gray-400'
}[s] || 'text-gray-500');

export default function InternDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'intern'],
    queryFn: () => api.get('/dashboard/intern').then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = data || {};

  if (!d.hasProfile) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
          <User size={36} className="text-reliance-blue" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Intern Profile Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your profile hasn't been set up yet. Please contact your HR or Manager.
        </p>
        <div className="card p-5 text-left space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">What happens next?</p>
          <p>1. HR creates your intern profile</p>
          <p>2. Manager assigns you to a Buddy & Tech Lead</p>
          <p>3. You start submitting daily standups</p>
        </div>
      </div>
    );
  }

  const { intern, assignment, standupCount, todayStandupSubmitted,
    milestonesCompleted, totalMilestones, progressPercent,
    recentStandups, upcomingMilestones } = d;

  const daysLeft = intern?.endDate
    ? Math.max(0, differenceInDays(new Date(intern.endDate), new Date()))
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        {!todayStandupSubmitted && (
          <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.SUBMIT_STANDUP)} className="btn-primary">
            <ClipboardList size={16} /> Submit Today's Standup
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-reliance-blue to-blue-600 text-white p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold">{intern.name}</h2>
            <p className="text-white/60 text-sm mt-1">{intern.stream} · {intern.university}</p>
          </div>
          {daysLeft !== null && (
            <div className="text-right">
              <p className="text-4xl font-black">{daysLeft}</p>
              <p className="text-white/70 text-xs">days remaining</p>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Programme Progress</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{intern.startDate ? format(new Date(intern.startDate), 'dd MMM yyyy') : ''}</span>
            <span>{intern.endDate ? format(new Date(intern.endDate), 'dd MMM yyyy') : ''}</span>
          </div>
        </div>
      </div>

      {/* Standup alert */}
      {!todayStandupSubmitted && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 text-sm">Today's standup not submitted</p>
            <p className="text-amber-600 text-xs">Don't forget — submit before 10:00 AM to avoid a late mark.</p>
          </div>
          <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.SUBMIT_STANDUP)}
            className="btn text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs px-3 py-1.5 flex-shrink-0">
            Submit now
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Standups Submitted', value: standupCount, icon: <ClipboardList size={20} className="text-white" />, bg: 'bg-purple-500' },
          { label: 'Milestones Done', value: milestonesCompleted, icon: <CheckCircle size={20} className="text-white" />, bg: 'bg-emerald-500' },
          { label: 'Total Milestones', value: totalMilestones, icon: <Flag size={20} className="text-white" />, bg: 'bg-blue-500' },
          { label: 'Today\'s Standup', value: todayStandupSubmitted ? '✓' : '✗', icon: <Clock size={20} className="text-white" />, bg: todayStandupSubmitted ? 'bg-emerald-500' : 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming milestones */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Flag size={16} className="text-reliance-blue" /> Upcoming Milestones
            </h3>
            <button onClick={() => navigate(`/progress/me`)}
              className="text-xs text-reliance-blue hover:underline font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {(upcomingMilestones || []).length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">All milestones completed!</div>
            ) : (
              (upcomingMilestones || []).map((m: any) => (
                <div key={m._id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-reliance-blue flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.phase}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${msStatusColor(m.status)}`}>{m.status}</p>
                    {m.dueDate && <p className="text-[10px] text-gray-400">{format(new Date(m.dueDate), 'dd MMM')}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assignment & recent standups */}
        <div className="space-y-4">
          {/* My team */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-800">My Team</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { role: 'Manager', data: assignment?.managerId },
                { role: 'Buddy', data: assignment?.buddyId },
              ].map(({ role, data: person }) => (
                <div key={role} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600
                    flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {person?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{person?.name || 'Not assigned'}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent standups */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-800">Recent Standups</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(recentStandups || []).length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-sm">No standups yet.</div>
              ) : (
                (recentStandups || []).slice(0, 3).map((s: any) => (
                  <div key={s._id} className="px-5 py-3 flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.isLate ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{s.date ? format(new Date(s.date), 'EEE, dd MMM') : ''}</p>
                      <p className="text-sm text-gray-700 truncate">{s.today}</p>
                    </div>
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
