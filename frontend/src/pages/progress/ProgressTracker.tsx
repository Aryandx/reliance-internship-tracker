import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const phaseColor = (phase: string) => {
  const m: Record<string, string> = {
    Onboarding: 'bg-blue-100 text-blue-700',
    Development: 'bg-purple-100 text-purple-700',
    Delivery: 'bg-amber-100 text-amber-700',
    Closure: 'bg-emerald-100 text-emerald-700',
  };
  return m[phase] || 'bg-gray-100 text-gray-700';
};

const statusIcon = (s: string) => {
  if (s === 'Completed') return <CheckCircle size={18} className="text-emerald-500" />;
  if (s === 'In Progress') return <Clock size={18} className="text-blue-500 animate-pulse" />;
  if (s === 'Overdue') return <AlertCircle size={18} className="text-red-500" />;
  return <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 bg-white" />;
};

export default function ProgressTracker() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const effectiveId = id === 'me' ? null : id;

  const { data: intern } = useQuery({
    queryKey: ['intern-by-email', user?.email],
    queryFn: () => api.get('/interns').then(r => {
      const all = r.data.data;
      return all.find((i: any) => i.email === user?.email) || null;
    }),
    enabled: id === 'me',
  });

  const targetId = effectiveId || intern?._id;

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', targetId],
    queryFn: () => api.get(`/milestones/${targetId}`).then(r => r.data.data),
    enabled: !!targetId,
  });

  const { data: internData } = useQuery({
    queryKey: ['intern', targetId],
    queryFn: () => api.get(`/interns/${targetId}`).then(r => r.data.data),
    enabled: !!targetId && id !== 'me',
  });

  const mutation = useMutation({
    mutationFn: ({ msId, status }: { msId: string; status: string }) =>
      api.patch(`/milestones/${msId}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones', targetId] });
      toast.success('Milestone updated');
    },
  });

  if (!targetId && !isLoading) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <Flag size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
        <p className="text-gray-500 text-sm">Your intern profile hasn't been created yet.</p>
      </div>
    );
  }

  const ms: any[] = milestones || [];
  const phases = [...new Set(ms.map(m => m.phase))];
  const completed = ms.filter(m => m.status === 'Completed').length;
  const progress = ms.length ? Math.round((completed / ms.length) * 100) : 0;

  const statuses = ['Not Started', 'In Progress', 'Completed', 'Overdue'];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline p-2"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id === 'me' ? 'My Progress' : `${internData?.name || 'Intern'}'s Progress`}
          </h1>
          <p className="text-sm text-gray-500">{completed}/{ms.length} milestones completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-2xl font-bold text-reliance-blue">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-reliance-blue to-emerald-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
          {[
            { label: 'Total', count: ms.length, color: 'text-gray-600' },
            { label: 'Completed', count: ms.filter(m => m.status === 'Completed').length, color: 'text-emerald-600' },
            { label: 'In Progress', count: ms.filter(m => m.status === 'In Progress').length, color: 'text-blue-600' },
            { label: 'Overdue', count: ms.filter(m => m.status === 'Overdue').length, color: 'text-red-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className={`text-xl font-bold ${color}`}>{count}</p>
              <p className="text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        phases.map(phase => {
          const phaseMilestones = ms.filter(m => m.phase === phase);
          return (
            <div key={phase} className="card">
              <div className="card-header flex items-center gap-3">
                <span className={`badge ${phaseColor(phase)}`}>{phase}</span>
                <span className="text-sm text-gray-500">
                  {phaseMilestones.filter(m => m.status === 'Completed').length}/{phaseMilestones.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {phaseMilestones.map(m => (
                  <div key={m._id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 flex justify-center">{statusIcon(m.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${m.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {m.title}
                      </p>
                      {m.dueDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Due: {format(new Date(m.dueDate), 'dd MMM yyyy')}
                          {m.ownerRole && ` · ${m.ownerRole}`}
                        </p>
                      )}
                    </div>
                    {(user?.role !== 'INTERN') && (
                      <select
                        value={m.status}
                        onChange={e => mutation.mutate({ msId: m._id, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600
                          focus:outline-none focus:ring-1 focus:ring-reliance-blue cursor-pointer flex-shrink-0"
                      >
                        {statuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
