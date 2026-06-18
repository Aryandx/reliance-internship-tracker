import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import { getDashboardRouteForRole } from '../../router/routeConfig';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'INTERN', label: 'Intern' },
  { value: 'BUDDY', label: 'Buddy' },
  { value: 'TECH_LEAD', label: 'Tech Lead' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'HR', label: 'HR' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'INTERN' as UserRole });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      const { user } = useAuthStore.getState();
      toast.success(`Welcome, ${user?.name}!`);
      navigate(getDashboardRouteForRole(user?.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1b2a] to-[#1e3a5f] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
            flex items-center justify-center text-white font-black text-lg">R</div>
          <div>
            <p className="font-bold text-gray-900">Reliance</p>
            <p className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">New Energy</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-1">Create account</h3>
        <p className="text-gray-500 text-sm mb-6">Join the Graduate Accelerator Programme</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              className="input" placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)}
              className="input" placeholder="you@reliance.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={form.password} onChange={(e) => set('password', e.target.value)}
              className="input" placeholder="At least 6 characters" minLength={6} />
          </div>
          <div>
            <label className="label">Role</label>
            <select required value={form.role} onChange={(e) => set('role', e.target.value)} className="input">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-base mt-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-reliance-blue font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
