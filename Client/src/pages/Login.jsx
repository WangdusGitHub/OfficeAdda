import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, KeyRound, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loggedUser = await login(email, password);
    setLoading(false);
    if (loggedUser) {
      loggedUser.isFirstLogin ? setShowReset(true) : navigate('/');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await axios.put('/auth/reset-first-password', { newPassword });
      if (data.success) { toast.success('Password set! Welcome.'); navigate('/'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] dark:bg-[#0d0f12] transition-colors duration-300">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col justify-between p-12 bg-primary-600 text-white relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">
          <div className="relative w-64 h-12 flex items-center">
            <img src="/logo-dark.png" alt="OfficeAdda" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] max-w-none mix-blend-screen pointer-events-none" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manage your<br />workforce with ease
          </h1>
          <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
            A unified platform for HR, attendance, payroll, and performance management.
          </p>
        </div>

        <div className="relative z-10 text-xs text-primary-300">
          © {new Date().getFullYear()} OfficeAdda. All rights reserved.
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="relative w-48 h-10 mb-8 lg:hidden flex items-center">
            <img src="/logo-light.png" alt="OfficeAdda" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] max-w-none dark:hidden mix-blend-multiply pointer-events-none" />
            <img src="/logo-dark.png" alt="OfficeAdda" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] max-w-none hidden dark:block mix-blend-screen pointer-events-none" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {showReset ? 'Set your password' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {showReset
              ? 'Create a permanent password for your account.'
              : 'Sign in to access your dashboard.'}
          </p>

          {showReset ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    className="input-field pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required minLength={6}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="input-field pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required minLength={6}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Set Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="admin@ems.com"
                    className="input-field pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
                  <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer">Remember me</label>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign in
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected by AES-256 encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
