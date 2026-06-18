import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Star, ChevronDown, ChevronUp, Send, CheckCircle, Loader2 } from 'lucide-react';

const stateLabel: Record<string, string> = {
  TL_REVIEW: 'Awaiting Tech Lead',
  MGR_REVIEW: 'Awaiting Manager',
  HR_FINAL: 'Awaiting HR Finalization',
  PUBLISHED: 'Published',
};

const stateColor: Record<string, string> = {
  TL_REVIEW: 'badge bg-purple-100 text-purple-700',
  MGR_REVIEW: 'badge bg-blue-100 text-blue-700',
  HR_FINAL: 'badge bg-amber-100 text-amber-700',
  PUBLISHED: 'badge bg-emerald-100 text-emerald-700',
};

export default function ReviewInbox() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['review-inbox'],
    queryFn: () => api.get('/reviews/inbox').then((r) => r.data.data),
  });

  const forwardMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      api.post(`/reviews/${id}/forward`, { comment }),
    onSuccess: () => {
      toast.success('Review forwarded');
      qc.invalidateQueries({ queryKey: ['review-inbox'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Failed'),
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      api.post(`/reviews/${id}/finalize`, { comment }),
    onSuccess: () => {
      toast.success('Review finalized and published!');
      qc.invalidateQueries({ queryKey: ['review-inbox'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Failed'),
  });

  const reviews: any[] = data || [];

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!reviews.length) return (
    <div className="max-w-2xl mx-auto mt-20 text-center">
      <CheckCircle size={48} className="mx-auto text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Inbox Empty</h2>
      <p className="text-gray-500 text-sm">No reviews awaiting your action.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Inbox</h1>
        <p className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''} awaiting action</p>
      </div>

      {reviews.map((r: any) => (
        <div key={r._id} className="card">
          <div className="card-header flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-gray-900">{r.internId?.name}</p>
                <p className="text-xs text-gray-500">{r.internId?.employeeCode} · Cycle {r.cycle}</p>
              </div>
              <span className={stateColor[r.state]}>{stateLabel[r.state]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{format(new Date(r.updatedAt), 'dd MMM')}</span>
              {expanded === r._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {expanded === r._id && (
            <div className="p-5 space-y-4 border-t border-gray-50">
              {/* Draft content */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={16} className={n <= r.draft.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">{r.draft.rating}/5</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Strengths</p>
                  <p className="text-sm text-gray-800 mt-1">{r.draft.strengths}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Improvements</p>
                  <p className="text-sm text-gray-800 mt-1">{r.draft.improvements}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Summary</p>
                  <p className="text-sm text-gray-800 mt-1">{r.draft.summary}</p>
                </div>
              </div>

              {/* Previous stage comments */}
              {r.stages?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage Trail</p>
                  {r.stages.map((s: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="badge badge-gray flex-shrink-0">{s.stage}</span>
                      <p className="text-gray-600">{s.comment || '(no comment)'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action area */}
              <div className="space-y-2">
                <label className="label">Your comment</label>
                <textarea
                  rows={3}
                  value={comments[r._id] || ''}
                  onChange={(e) => setComments((c) => ({ ...c, [r._id]: e.target.value }))}
                  className="input resize-none"
                  placeholder="Add your comment before forwarding…"
                />
                <div className="flex gap-2">
                  {user?.role !== 'HR' ? (
                    <button
                      onClick={() => forwardMutation.mutate({ id: r._id, comment: comments[r._id] || '' })}
                      disabled={forwardMutation.isPending}
                      className="btn-primary text-sm"
                    >
                      {forwardMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Forward to Next Stage
                    </button>
                  ) : (
                    <button
                      onClick={() => finalizeMutation.mutate({ id: r._id, comment: comments[r._id] || '' })}
                      disabled={finalizeMutation.isPending}
                      className="btn-primary text-sm bg-emerald-600 hover:bg-emerald-700"
                    >
                      {finalizeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Finalize & Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
