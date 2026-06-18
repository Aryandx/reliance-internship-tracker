import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function MyFeedback() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => api.get('/reviews/my').then((r) => r.data.data),
  });

  const reviews: any[] = data || [];

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!reviews.length) return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Feedback Yet</h2>
      <p className="text-gray-500 text-sm">Your performance reviews will appear here once finalized by HR.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
        <p className="text-sm text-gray-500">Finalized performance reviews visible to you</p>
      </div>

      {reviews.map((r: any) => (
        <div key={r._id} className="card">
          <div className="card-header flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
            <div>
              <p className="font-semibold text-gray-900">Cycle {r.cycle}</p>
              <p className="text-xs text-gray-500">Published {format(new Date(r.publishedAt), 'dd MMM yyyy')}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={16} className={n <= r.draft.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
          </div>

          {expanded === r._id && (
            <div className="p-5 space-y-4 border-t border-gray-50">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Strengths</p>
                <p className="text-sm text-gray-800">{r.draft.strengths}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Areas to Improve</p>
                <p className="text-sm text-gray-800">{r.draft.improvements}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Overall Summary</p>
                <p className="text-sm text-gray-800">{r.draft.summary}</p>
              </div>

              {r.stages?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Comments from reviewers</p>
                  {r.stages.filter((s: any) => s.comment).map((s: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="badge badge-gray text-xs flex-shrink-0">{s.stage}</span>
                      <p className="text-gray-600">{s.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
