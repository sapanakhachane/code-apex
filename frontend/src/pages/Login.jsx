import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, Lock, Mail, ArrowRight, UserCheck,
  CheckCircle, AlertTriangle, Sparkles
} from 'lucide-react';

export const Login = () => {
  const { loginWithCredentials, loginWithRole, DEMO_ACCOUNTS } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide your email and password.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await loginWithCredentials(email, password);
      if (result.success) {
        redirectToDashboard(result.user.role);
      }
    } catch (err) {
      setError("Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (roleKey) => {
    const user = loginWithRole(roleKey);
    redirectToDashboard(user.role);
  };

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'Authority':
        navigate('/authority-dashboard');
        break;
      case 'Rescue Team':
        navigate('/rescue-dashboard');
        break;
      case 'Hospital Administrator':
        navigate('/hospitals');
        break;
      case 'Citizen':
      default:
        navigate('/citizen-dashboard');
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-cyan-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-red-500/20">
          🚨
        </div>
        <h1 className="text-2xl font-black text-white">CrisisMesh AI Authentication</h1>
        <p className="text-xs text-slate-400">
          Sign in to access your designated emergency response dashboard.
        </p>
      </div>

      {/* 1-CLICK DEMO ACCOUNTS FOR HACKATHON JURY */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-navy-950 border border-purple-500/40 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hackathon 1-Click Role Login</span>
          </span>
          <span className="text-[10px] font-mono text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
            DEMO PREVIEW
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Select any verified persona to instantly simulate role-based workflows:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('citizen')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span>👨‍💼</span>
              <span>Citizen</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Dr. Rajesh Sharma</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('authority')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <span>🎖️</span>
              <span>Authority</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Dir. K. Verma</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('rescue')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span>🚑</span>
              <span>Rescue Team</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ambulance 12</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('hospital')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
              <span>🏥</span>
              <span>Hospital Chief</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Lilavati Trauma</span>
          </button>
        </div>
      </div>

      {/* Standard Credentials Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
        <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@crisismesh.ai"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
