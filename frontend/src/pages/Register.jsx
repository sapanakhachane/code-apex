import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, User, Mail, Phone, Lock, CheckCircle,
  AlertTriangle, ShieldCheck
} from 'lucide-react';

export const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Citizen');
  const [password, setPassword] = useState('');
  const [approvalNotice, setApprovalNotice] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerUser({ name, email, phone, role, password });
      if (res.requiresApproval) {
        setApprovalNotice(true);
      } else {
        navigate('/citizen-dashboard');
      }
    } catch (err) {
      alert("Registration failed. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">Create CrisisMesh Account</h1>
        <p className="text-xs text-slate-400">
          Join the disaster management and emergency intelligence network.
        </p>
      </div>

      {approvalNotice ? (
        <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Account Created: Verification Pending</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Per system security protocols, <strong>{role}</strong> roles require administrator vetting before full command clearance is activated.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Joshi"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikram@example.com"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">User Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Citizen">Citizen (Immediate Access)</option>
              <option value="Authority">Authority (Requires Admin Vetting)</option>
              <option value="Rescue Team">Rescue Team (Requires Admin Vetting)</option>
              <option value="Hospital Administrator">Hospital Administrator (Requires Admin Vetting)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Create Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
