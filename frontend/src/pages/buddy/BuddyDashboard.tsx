import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ClipboardList, Flag, MessageSquare, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../router/routeConfig';

export default function BuddyDashboard() {
  const navigate = useNavigate();
  const { data: feed, isLoading } = useQuery({
    queryKey: ['standup-feed'],
    queryFn: () => api.get('/standups/feed').then(r => r.data.data),
  });

  const standups: any[] = feed || [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStandups = standups.filter(s => new Date(s.date) >= today);
  const unreplied = standups.filter(s => !s.replies?.length);
  const blockers = standups.filter(s => s.hasBlocker && !s.replies?.length);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buddy Dashboard</h1>
          <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Standups', value: standups.length, icon: <ClipboardList size={20} className="text-white" />, bg: 'bg-blue-500' },
          { label: 'Today\'s Standups', value: todayStandups.length, icon: <Clock size={20} className="text-white" />, bg: 'bg-purple-500' },
          { label: 'Awaiting Reply', value: unreplied.length, icon: <MessageSquare size={20} className="text-white" />, bg: 'bg-amber-500' },
          { label: 'Active Blockers', value: blockers.length, icon: <Flag size={20} className="text-white" />, bg: 'bg-red-500' },
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

      {/* Blockers alert */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-semibold text-red-800 text-sm mb-2">🚨 {blockers.length} Active Blocker{blockers.length > 1 ? 's' : ''}</p>
          <div className="space-y-2">
            {blockers.map(s => (
              <div key={s._id} className="bg-white rounded-lg p-3 border border-red-100">
                <p className="font-medium text-sm text-gray-900">{s.internId?.name}</p>
                <p className="text-sm text-red-700 mt-0.5">{s.blocker}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent standups */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Standups</h3>
          <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.STANDUP_FEED)}
            className="text-xs text-reliance-blue hover:underline font-medium flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : standups.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No standups from your interns yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {standups.slice(0, 8).map((s) => (
              <div key={s._id}
                onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.STANDUP_FEED)}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
                  flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                  {s.internId?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{s.internId?.name}</span>
                    {s.hasBlocker && <span className="badge-red text-[10px]">Blocker</span>}
                    {s.isLate && <span className="badge-amber text-[10px]">Late</span>}
                    {s.replies?.length > 0 && <span className="badge-green text-[10px]">Replied</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{s.today}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{s.date ? format(new Date(s.date), 'dd MMM') : ''}</p>
                  <ChevronRight size={14} className="text-gray-300 mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
