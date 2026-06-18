import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, GitBranch, Loader2, CheckCircle } from 'lucide-react';

interface Assignment {
  internId: any;
  managerId: any;
  techLeadId: any;
  buddyId: any;
  hrId: any;
}

const RoleSelector = ({
  label, internId, currentId, users, roleKey, onSave
}: {
  label: string; internId: string; currentId?: string;
  users: any[]; roleKey: string;
  onSave: (internId: string, roleKey: string, userId: string) => void;
}) => (
  <div className="flex items-center gap-3">
    <p className="w-20 text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">{label}</p>
    <select
      className="input flex-1 text-sm"
      value={currentId || ''}
      onChange={(e) => onSave(internId, roleKey, e.target.value)}
    >
      <option value="">— Unassigned —</option>
      {users.map((u) => (
        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
      ))}
    </select>
    {currentId && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />}
  </div>
);

export default function AssignManager() {
  const qc = useQueryClient();

  const { data: interns, isLoading: internLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: () => api.get('/interns').then(r => r.data.data),
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => api.get('/assignments').then(r => r.data.data),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: ({ internId, key, userId }: { internId: string; key: string; userId: string }) =>
      api.patch(`/assignments/${internId}`, { [key]: userId || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const getAssignment = (internId: string) =>
    (assignments || []).find((a: any) => a.internId?._id === internId || a.internId === internId);

  const filterByRole = (role: string) => (allUsers || []).filter((u: any) => u.role === role);

  const handleSave = (internId: string, key: string, userId: string) => {
    mutation.mutate({ internId, key, userId });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Assignments</h1>
        <p className="text-sm text-gray-500">Assign Manager, Tech Lead, Buddy and HR to each intern</p>
      </div>

      {internLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (interns || []).length === 0 ? (
        <div className="card py-20 text-center">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No interns to assign yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(interns || []).map((intern: any) => {
            const asgn = getAssignment(intern._id);
            return (
              <div key={intern._id} className="card">
                <div className="card-header flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {intern.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{intern.name}</p>
                    <p className="text-xs text-gray-400">{intern.email} · {intern.stream || 'No stream'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`badge ${intern.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                      {intern.status}
                    </span>
                    {mutation.isPending && <Loader2 size={14} className="text-gray-400 animate-spin" />}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <RoleSelector label="Manager" internId={intern._id}
                    currentId={asgn?.managerId?._id || asgn?.managerId}
                    users={filterByRole('MANAGER')} roleKey="managerId" onSave={handleSave} />
                  <RoleSelector label="Tech Lead" internId={intern._id}
                    currentId={asgn?.techLeadId?._id || asgn?.techLeadId}
                    users={filterByRole('TECH_LEAD')} roleKey="techLeadId" onSave={handleSave} />
                  <RoleSelector label="Buddy" internId={intern._id}
                    currentId={asgn?.buddyId?._id || asgn?.buddyId}
                    users={filterByRole('BUDDY')} roleKey="buddyId" onSave={handleSave} />
                  <RoleSelector label="HR" internId={intern._id}
                    currentId={asgn?.hrId?._id || asgn?.hrId}
                    users={filterByRole('HR')} roleKey="hrId" onSave={handleSave} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
