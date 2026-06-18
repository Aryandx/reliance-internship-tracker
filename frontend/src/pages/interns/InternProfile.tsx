import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { ArrowLeft, Edit3, GitBranch, Flag, ClipboardList, CheckCircle, Clock, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { ROUTES } from '../../router/routeConfig';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Active: 'badge-green', Pending: 'badge-amber', Completed: 'badge-blue', Withdrawn: 'badge-red'
  };
  return <span className={m[s] || 'badge-gray'}>{s}</span>;
};

const msStatusIcon = (s: string) => {
  if (s === 'Completed') return <CheckCircle size={14} className="text-emerald-500" />;
  if (s === 'In Progress') return <Clock size={14} className="text-blue-500" />;
  if (s === 'Overdue') return <Clock size={14} className="text-red-500" />;
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />;
};

export default function InternProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['intern', id],
    queryFn: () => api.get(`/interns/${id}`).then(r => r.data.data),
    enabled: !!id && id !== 'me',
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones', id],
    queryFn: () => api.get(`/milestones/${id}`).then(r => r.data.data),
    enabled: !!id && id !== 'me',
  });

  const { data: standups } = useQuery({
    queryKey: ['standups', id],
    queryFn: () => api.get(`/standups?internId=${id}`).then(r => r.data.data),
    enabled: !!id && id !== 'me',
  });

  const updateMsMutation = useMutation({
    mutationFn: ({ msId, status }: { msId: string; status: string }) =>
      api.patch(`/milestones/${msId}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['milestones', id] }); toast.success('Milestone updated'); },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!data) return <p className="text-center py-20 text-gray-500">Intern not found.</p>;

  const intern = data;
  const assignment = data.assignment;
  const ms: any[] = milestones || [];
  const ss: any[] = standups || [];
  const completedMs = ms.filter(m => m.status === 'Completed').length;
  const daysLeft = intern.endDate ? Math.max(0, differenceInDays(new Date(intern.endDate), new Date())) : null;

  const msStatuses = ['Not Started', 'In Progress', 'Completed', 'Overdue'];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline p-2"><ArrowLeft size={16} /></button>
        <h1 className="text-xl font-bold text-gray-900">Intern Profile</h1>
      </div>

      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-reliance-blue to-blue-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg
              flex items-center justify-center text-reliance-blue font-black text-3xl">
              {intern.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{intern.name}</h2>
                {statusBadge(intern.status)}
              </div>
              <p className="text-gray-500 text-sm">{intern.email} · {intern.phone || 'No phone'}</p>
            </div>
            <button onClick={() => navigate(`/interns/${id}/edit`)}
              className="btn-outline gap-2 mb-1"><Edit3 size={15} /> Edit</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'University', value: intern.university || '—' },
              { label: 'Stream', value: intern.stream || '—' },
              { label: 'Domain', value: intern.domain || '—' },
              { label: 'Days Left', value: daysLeft !== null ? `${daysLeft} days` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Milestones */}
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Flag size={16} className="text-reliance-blue" /> Milestones
            </h3>
            <span className="text-xs text-gray-500">{completedMs}/{ms.length} completed</span>
          </div>
          {ms.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No milestones generated.</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {ms.map((m) => (
                <div key={m._id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0">{msStatusIcon(m.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${m.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-400">{m.phase} · {m.dueDate ? format(new Date(m.dueDate), 'dd MMM yyyy') : 'No due date'}</p>
                  </div>
                  <select
                    value={m.status}
                    onChange={(e) => updateMsMutation.mutate({ msId: m._id, status: e.target.value })}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600
                      focus:outline-none focus:ring-1 focus:ring-reliance-blue cursor-pointer flex-shrink-0"
                  >
                    {msStatuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Assignment */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <GitBranch size={15} className="text-reliance-blue" />
              <h3 className="font-semibold text-gray-800">Assigned To</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Manager', person: assignment?.managerId },
                { label: 'Tech Lead', person: assignment?.techLeadId },
                { label: 'Buddy', person: assignment?.buddyId },
                { label: 'HR', person: assignment?.hrId },
              ].map(({ label, person }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600
                    flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {person?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{person?.name || 'Not assigned'}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.MAP_MANAGER)}
                className="btn-outline w-full text-xs mt-2">
                Manage Assignments
              </button>
            </div>
          </div>

          {/* Recent standups */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <ClipboardList size={15} className="text-reliance-blue" />
              <h3 className="font-semibold text-gray-800">Standups</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {ss.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-sm">No standups yet.</div>
              ) : (
                ss.slice(0, 5).map((s) => (
                  <div key={s._id} className="px-4 py-2.5 flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.isLate ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{s.date ? format(new Date(s.date), 'EEE dd MMM') : ''}</p>
                      <p className="text-xs text-gray-700 truncate">{s.today}</p>
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

