import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, Plus, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '../../router/routeConfig';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: 'badge badge-amber',
  ACTIVE: 'badge badge-green',
  COMPLETED: 'badge badge-blue',
  TERMINATED: 'badge badge-red',
};

export default function InternList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['interns', search],
    queryFn: () => api.get('/interns', { params: search ? { q: search } : {} }).then((r) => r.data.data),
  });

  const interns: any[] = data || [];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intern Directory</h1>
          <p className="text-sm text-gray-500">{interns.length} intern{interns.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)} className="btn-primary">
          <Plus size={16} /> Add Intern
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search interns…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interns.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No interns found</p>
            <button onClick={() => navigate(ROUTES.WORKSPACE.STANDARD.CREATE_INTERN)} className="btn-primary mt-4">
              <Plus size={16} /> Add First Intern
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Code</th>
                  <th className="text-left px-5 py-3 font-semibold">Department</th>
                  <th className="text-left px-5 py-3 font-semibold">Start Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interns.map((intern: any) => (
                  <tr key={intern._id}
                    onClick={() => navigate(`/interns/${intern._id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
                          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {intern.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{intern.name}</p>
                          <p className="text-xs text-gray-400">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{intern.employeeCode || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{intern.department || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {intern.startDate ? format(new Date(intern.startDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={STATUS_COLORS[intern.status] || 'badge badge-gray'}>{intern.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight size={16} className="text-gray-300 ml-auto" />
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
