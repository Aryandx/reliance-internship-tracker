import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Send, AlertTriangle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmitStandup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    yesterday: '', today: '', blocker: '', hasBlocker: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/standups', data),
    onSuccess: () => {
      toast.success('Standup submitted!');
      navigate(-1);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit standup');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const charCount = (s: string, max: number) => (
    <span className={`text-xs ${s.length > max * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
      {s.length}/{max}
    </span>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline p-2"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Standup</h1>
          <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Send size={15} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Daily Standup</h3>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Yesterday — What did you complete?</label>
              {charCount(form.yesterday, 500)}
            </div>
            <textarea
              required
              value={form.yesterday}
              onChange={(e) => setForm((f) => ({ ...f, yesterday: e.target.value }))}
              maxLength={500}
              rows={4}
              className="input resize-none"
              placeholder="Describe what you accomplished yesterday…"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Today — What are you planning?</label>
              {charCount(form.today, 500)}
            </div>
            <textarea
              required
              value={form.today}
              onChange={(e) => setForm((f) => ({ ...f, today: e.target.value }))}
              maxLength={500}
              rows={4}
              className="input resize-none"
              placeholder="Describe what you plan to do today…"
            />
          </div>

          {/* Blocker toggle */}
          <div className="border border-dashed border-amber-300 rounded-xl p-4 bg-amber-50/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, hasBlocker: !f.hasBlocker }))}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.hasBlocker ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.hasBlocker ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <span className="font-medium text-sm text-gray-800">I have a blocker</span>
                <p className="text-xs text-gray-500">This will alert your Buddy immediately</p>
              </div>
              <AlertTriangle size={16} className={`ml-auto ${form.hasBlocker ? 'text-amber-500' : 'text-gray-300'}`} />
            </label>

            {form.hasBlocker && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0 text-amber-700">Describe the blocker *</label>
                  {charCount(form.blocker, 500)}
                </div>
                <textarea
                  required={form.hasBlocker}
                  value={form.blocker}
                  onChange={(e) => setForm((f) => ({ ...f, blocker: e.target.value }))}
                  maxLength={500}
                  rows={3}
                  className="input resize-none border-amber-300 focus:ring-amber-400"
                  placeholder="Describe what's blocking you…"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle size={15} className="text-emerald-500" />
            Your standup will be visible to your Buddy and Manager
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : <><Send size={16} /> Post Standup</>}
          </button>
        </div>
      </form>
    </div>
  );
}
