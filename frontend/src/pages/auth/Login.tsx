import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDashboardRouteForRole } from '../../router/routeConfig';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      toast.success(`Welcome back, ${user?.name}!`);
      navigate(getDashboardRouteForRole(user?.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0d1b2a] to-[#1e3a5f]">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
            flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-2xl">
            R
          </div>
          <h1 className="text-3xl font-bold mb-2">Reliance</h1>
          <p className="text-emerald-400 font-bold text-sm tracking-[0.3em] uppercase mb-8">New Energy</p>
          <h2 className="text-xl font-semibold mb-3">Graduate Accelerator Programme</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Track your internship journey — standups, milestones, reviews and more,
            all in one place.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[['Intern', 'Track progress'], ['Buddy', 'Guide & review'], ['Manager', 'Oversee teams']].map(([role, desc]) => (
              <div key={role} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <p className="font-semibold text-sm">{role}</p>
                <p className="text-slate-400 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                flex items-center justify-center text-white font-black text-lg">R</div>
              <div>
                <p className="font-bold text-gray-900">Reliance</p>
                <p className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">New Energy</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h3>
            <p className="text-gray-500 text-sm mb-6">Access the Internship Tracker</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input" placeholder="you@reliance.com"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10" placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-base">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to the platform?{' '}
              <Link to="/register" className="text-reliance-blue font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
