import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';

export default function WriteReview() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    internId: '',
    cycle: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    strengths: '',
    improvements: '',
    rating: 3,
    summary: '',
  });

  const { data: internsData } = useQuery({
    queryKey: ['my-interns-for-review'],
    queryFn: () => api.get('/interns/my').then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/reviews', data),
    onSuccess: () => {
      toast.success('Review saved as draft');
      navigate('/reviews/submitted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to save review');
    },
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.internId) { toast.error('Select an intern'); return; }
    mutation.mutate(form);
  };

  const interns: any[] = internsData || [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline p-2"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Write Performance Review</h1>
          <p className="text-sm text-gray-500">Draft saved until you submit to Tech Lead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Intern</label>
            <select required value={form.internId} onChange={(e) => set('internId', e.target.value)} className="input">
              <option value="">Select intern…</option>
              {interns.map((i: any) => (
                <option key={i._id} value={i._id}>{i.name} ({i.employeeCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Cycle</label>
            <input required value={form.cycle} onChange={(e) => set('cycle', e.target.value)} className="input" placeholder="2026-Q2" />
          </div>
        </div>

        <div>
          <label className="label">Rating</label>
          <div className="flex items-center gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => set('rating', n)}
                className={`p-1 rounded transition-colors ${n <= form.rating ? 'text-amber-400' : 'text-gray-200'}`}>
                <Star size={28} fill={n <= form.rating ? 'currentColor' : 'none'} />
              </button>
            ))}
            <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
          </div>
        </div>

        <div>
          <label className="label">Strengths</label>
          <textarea required rows={4} value={form.strengths} onChange={(e) => set('strengths', e.target.value)}
            className="input resize-none" placeholder="What did the intern do well?" />
        </div>

        <div>
          <label className="label">Areas for Improvement</label>
          <textarea required rows={4} value={form.improvements} onChange={(e) => set('improvements', e.target.value)}
            className="input resize-none" placeholder="What should the intern focus on improving?" />
        </div>

        <div>
          <label className="label">Overall Summary</label>
          <textarea required rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)}
            className="input resize-none" placeholder="Brief overall assessment…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Save as Draft
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
