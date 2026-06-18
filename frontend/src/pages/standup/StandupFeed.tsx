import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { format } from 'date-fns';
import { MessageSquare, AlertTriangle, CheckCircle, Send, Loader2, Clock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const StandupCard = ({ standup }: { standup: any }) => {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const qc = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: () => api.post(`/standups/${standup._id}/reply`, { reply: replyText }),
    onSuccess: () => {
      toast.success('Reply sent');
      setReplyText('');
      setShowReply(false);
      qc.invalidateQueries({ queryKey: ['standup-feed'] });
    },
  });

  return (
    <div className="card">
      <div className="px-5 py-4 flex items-start gap-3 border-b border-gray-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-reliance-blue to-blue-500
          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {standup.internId?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{standup.internId?.name || 'Unknown'}</span>
            {standup.isLate && <span className="badge-amber">Late</span>}
            {standup.hasBlocker && <span className="badge-red flex items-center gap-1"><AlertTriangle size={10} /> Blocker</span>}
            {standup.replies?.length > 0 && <span className="badge-green flex items-center gap-1"><CheckCircle size={10} /> Replied</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {standup.date ? format(new Date(standup.date), 'EEEE, d MMMM yyyy') : ''} ·{' '}
            {standup.submittedAt ? format(new Date(standup.submittedAt), 'HH:mm') : ''}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Yesterday</p>
          <p className="text-sm text-gray-700 leading-relaxed">{standup.yesterday}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Today</p>
          <p className="text-sm text-gray-700 leading-relaxed">{standup.today}</p>
        </div>
        {standup.hasBlocker && standup.blocker && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Blocker
            </p>
            <p className="text-sm text-amber-800">{standup.blocker}</p>
          </div>
        )}
      </div>

      {/* Replies */}
      {(standup.replies || []).length > 0 && (
        <div className="px-5 pb-3 space-y-2 border-t border-gray-50 pt-3">
          {standup.replies.map((r: any, i: number) => (
            <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center
                text-emerald-700 text-xs font-bold flex-shrink-0">B</div>
              <div>
                <p className="text-sm text-gray-700">{r.reply}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {r.repliedAt ? format(new Date(r.repliedAt), 'dd MMM HH:mm') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      <div className="px-5 pb-4 border-t border-gray-50 pt-3">
        {!showReply ? (
          <button onClick={() => setShowReply(true)}
            className="text-sm text-reliance-blue hover:underline flex items-center gap-1.5 font-medium">
            <MessageSquare size={14} /> Reply to standup
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              className="input flex-1 text-sm"
              placeholder="Write a reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && replyText.trim()) replyMutation.mutate(); }}
            />
            <button
              onClick={() => replyMutation.mutate()}
              disabled={!replyText.trim() || replyMutation.isPending}
              className="btn-primary px-3"
            >
              {replyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StandupFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['standup-feed'],
    queryFn: () => api.get('/standups/feed').then(r => r.data.data),
  });

  const standups: any[] = data || [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Standup Feed</h1>
          <p className="text-sm text-gray-500">{standups.length} standup{standups.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : standups.length === 0 ? (
        <div className="card py-20 text-center">
          <Clock size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No standups to show yet.</p>
          <p className="text-gray-400 text-sm mt-1">They'll appear here once interns start submitting.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {standups.map((s) => <StandupCard key={s._id} standup={s} />)}
        </div>
      )}
    </div>
  );
}
