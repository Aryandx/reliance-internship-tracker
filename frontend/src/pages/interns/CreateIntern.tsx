import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';

const DEPARTMENTS = ['New Energy Digital', 'Engineering', 'Data Science', 'Operations', 'Finance', 'HR'];

export default function CreateIntern() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', university: '',
    department: 'New Energy Digital', stream: '', domain: '',
    startDate: '', programDuration: '8', notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/interns', data),
    onSuccess: (res) => {
      toast.success('Intern created! A login account has been created with password: Welcome@123');
      navigate(`/interns/${res.data.data._id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to create intern');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const startDate = new Date(form.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(form.programDuration) * 7);

    mutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      university: form.university || undefined,
      department: form.department,
      stream: form.stream || undefined,
      domain: form.domain || undefined,
      startDate: form.startDate,
      endDate: endDate.toISOString().split('T')[0],
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline p-2"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Intern</h1>
          <p className="text-sm text-gray-500">Fill in the intern's details to onboard them</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-reliance-blue flex items-center justify-center">
            <UserPlus size={16} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Intern Details</h3>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                className="input" placeholder="e.g. Aarav Sharma" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)}
                className="input" placeholder="aarav@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                className="input" placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="label">University</label>
              <input value={form.university} onChange={(e) => set('university', e.target.value)}
                className="input" placeholder="e.g. Mumbai University" />
            </div>
            <div>
              <label className="label">Department *</label>
              <select required value={form.department} onChange={(e) => set('department', e.target.value)} className="input">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Programme Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Technical Stream</label>
                <input value={form.stream} onChange={(e) => set('stream', e.target.value)}
                  className="input" placeholder="e.g. Software Engineering" />
              </div>
              <div>
                <label className="label">Domain</label>
                <input value={form.domain} onChange={(e) => set('domain', e.target.value)}
                  className="input" placeholder="e.g. Web, AI/ML" />
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input type="date" required value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Duration (weeks)</label>
                <select value={form.programDuration} onChange={(e) => set('programDuration', e.target.value)} className="input">
                  {[4, 6, 8, 10, 12, 16, 24].map((n) => (
                    <option key={n} value={n}>{n} weeks</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <label className="label">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Any additional notes about the intern…" />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending
              ? <><Loader2 size={16} className="animate-spin" /> Creating…</>
              : <><UserPlus size={16} /> Create Intern</>}
          </button>
        </div>
      </form>

      <div className="card p-5 bg-blue-50 border border-blue-100">
        <p className="text-sm font-semibold text-blue-800 mb-2">What happens after creation?</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Intern login account created (password: <strong>Welcome@123</strong>)</li>
          <li>✓ 10 milestone checkpoints auto-generated from the start date</li>
          <li>✓ Assignment record created — assign Manager, Tech Lead, Buddy next</li>
          <li>✓ Attendance tracking begins from the start date</li>
        </ul>
      </div>
    </div>
  );
}
