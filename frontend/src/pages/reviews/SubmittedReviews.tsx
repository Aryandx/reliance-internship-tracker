import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Star, PlusCircle } from 'lucide-react';

const stateColors: Record<string, string> = {
  DRAFT: 'badge bg-gray-100 text-gray-600',
  TL_REVIEW: 'badge bg-purple-100 text-purple-700',
  MGR_REVIEW: 'badge bg-blue-100 text-blue-700',
  HR_FINAL: 'badge bg-amber-100 text-amber-700',
  PUBLISHED: 'badge bg-emerald-100 text-emerald-700',
};

const stateLabels: Record<string, string> = {
  DRAFT: 'Draft',
  TL_REVIEW: 'With Tech Lead',
  MGR_REVIEW: 'With Manager',
  HR_FINAL: 'With HR',
  PUBLISHED: 'Published',
};

export default function SubmittedReviews() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['buddy-reviews'],
    queryFn: () => api.get('/reviews/submitted').then((r) => r.data.data),
  });

  const reviews: any[] = data || [];

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500">Track reviews you authored</p>
        </div>
        <button onClick={() => navigate('/reviews/new')} className="btn-primary">
          <PlusCircle size={16} /> New Review
        </button>
      </div>

      {!reviews.length ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400 text-sm">No reviews written yet.</p>
          <button onClick={() => navigate('/reviews/new')} className="btn-primary mt-4">Write First Review</button>
        </div>
      ) : (
        reviews.map((r: any) => (
          <div key={r._id} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{r.internId?.name}</p>
              <p className="text-xs text-gray-500">{r.internId?.employeeCode} · Cycle {r.cycle}</p>
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(r.updatedAt), 'dd MMM yyyy')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} size={14} className={n <= r.draft?.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className={stateColors[r.state]}>{stateLabels[r.state]}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
