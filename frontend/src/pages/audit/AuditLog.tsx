import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  INTERN_CREATED: 'badge bg-emerald-100 text-emerald-700',
  INTERN_UPDATED: 'badge bg-blue-100 text-blue-700',
  MANAGER_ASSIGNED: 'badge bg-purple-100 text-purple-700',
  TECHLEAD_ASSIGNED: 'badge bg-indigo-100 text-indigo-700',
  BUDDY_ASSIGNED: 'badge bg-teal-100 text-teal-700',
  STANDUP_SUBMITTED: 'badge bg-amber-100 text-amber-700',
  STANDUP_REPLIED: 'badge bg-orange-100 text-orange-700',
  REVIEW_CREATED: 'badge bg-pink-100 text-pink-700',
  REVIEW_FORWARDED: 'badge bg-violet-100 text-violet-700',
  REVIEW_FINALIZED: 'badge bg-green-100 text-green-700',
};

export default function AuditLog() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState({ entity: '', action: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', filters],
    queryFn: () => {
      const params: any = { page: filters.page, limit: 50 };
      if (filters.entity) params.entity = filters.entity;
      if (filters.action) params.action = filters.action;
      return api.get('/audit', { params }).then((r) => r.data);
    },
  });

  const logs: any[] = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <ShieldCheck size={24} className="text-reliance-blue" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500">Append-only record of all state-changing actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <select value={filters.entity} onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value, page: 1 }))}
          className="input w-40 text-sm">
          <option value="">All entities</option>
          <option value="interns">Interns</option>
          <option value="assignments">Assignments</option>
          <option value="standups">Standups</option>
          <option value="reviews">Reviews</option>
        </select>
        <select value={filters.action} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))}
          className="input w-48 text-sm">
          <option value="">All actions</option>
          <option value="INTERN_CREATED">Intern Created</option>
          <option value="INTERN_UPDATED">Intern Updated</option>
          <option value="MANAGER_ASSIGNED">Manager Assigned</option>
          <option value="TECHLEAD_ASSIGNED">Tech Lead Assigned</option>
          <option value="BUDDY_ASSIGNED">Buddy Assigned</option>
          <option value="STANDUP_SUBMITTED">Standup Submitted</option>
          <option value="STANDUP_REPLIED">Standup Replied</option>
          <option value="REVIEW_CREATED">Review Created</option>
          <option value="REVIEW_FORWARDED">Review Forwarded</option>
          <option value="REVIEW_FINALIZED">Review Finalized</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !logs.length ? (
        <div className="card p-10 text-center text-gray-400 text-sm">No audit records found.</div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {logs.map((log: any) => (
            <div key={log._id}>
              <div
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === log._id ? null : log._id)}
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <span className={ACTION_COLORS[log.action] || 'badge badge-gray'}>{log.action}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      <span className="font-medium">{log.actorId?.name}</span>
                      <span className="text-gray-400 ml-1">({log.actorRole})</span>
                      <span className="text-gray-400 ml-1">on {log.entity}</span>
                    </p>
                    <p className="text-xs text-gray-400">{format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}</p>
                  </div>
                </div>
                {expanded === log._id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>

              {expanded === log._id && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {log.before && (
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">Before</p>
                        <pre className="bg-white rounded-lg p-3 overflow-auto text-gray-600 border border-gray-200">
                          {JSON.stringify(log.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.after && (
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">After</p>
                        <pre className="bg-white rounded-lg p-3 overflow-auto text-gray-600 border border-gray-200">
                          {JSON.stringify(log.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {meta && meta.total > meta.limit && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{meta.total} total records</span>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="btn-outline text-sm disabled:opacity-40">Previous</button>
            <span className="text-sm text-gray-500 self-center">Page {filters.page}</span>
            <button disabled={filters.page * meta.limit >= meta.total}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="btn-outline text-sm disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
