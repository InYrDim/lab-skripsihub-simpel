import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, UserCheck, ShieldCheck, FileCheck, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, quickLogin, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'Akun Anda sedang menunggu persetujuan Admin') {
          showToast(err.message, 'warning');
        } else {
          setError(err.message);
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  const handleDemoLogin = async (role: 'STUDENT' | 'ADMIN' | 'VALIDATOR') => {
    setError(null);
    try {
      await quickLogin(role);
      if (role === 'STUDENT') navigate('/student');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'VALIDATOR') navigate('/validator');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Quick login failed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex selection:bg-orange-500/30 font-sans">
      {/* Left Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="inline-flex items-center justify-center p-3.5 bg-orange-600 rounded text-white mb-6">
              <GraduationCap size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">
              SkripsiHub
            </h2>
            <p className="text-base text-zinc-500 font-medium">
              Thesis Title Submission & Approval System
            </p>
          </div>

          <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded flex items-center gap-2 text-rose-600 text-sm font-semibold">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent focus:bg-white rounded text-zinc-900 font-medium text-sm placeholder-zinc-400 focus:outline-none focus:ring-0 focus:border-orange-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent focus:bg-white rounded text-zinc-900 font-medium text-sm placeholder-zinc-400 focus:outline-none focus:ring-0 focus:border-orange-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/20 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="pt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-zinc-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    Demo Accounts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('STUDENT')}
                  className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-orange-200 hover:bg-orange-50 text-zinc-600 transition-all group"
                >
                  <UserCheck size={20} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-blue-200 hover:bg-blue-50 text-zinc-600 transition-all group"
                >
                  <ShieldCheck size={20} className="text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('VALIDATOR')}
                  className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 text-zinc-600 transition-all group"
                >
                  <FileCheck size={20} className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Validator</span>
                </button>
              </div>

              <div className="mt-8 text-center text-sm font-medium text-zinc-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-all">
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Graphic Side */}
      <div className="hidden lg:flex flex-1 bg-zinc-950 relative overflow-hidden items-center justify-center">
        {/* Accent abstract shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 p-10 max-w-lg">
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Streamline your thesis journey.
          </h1>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed">
            A minimal, modern approach to submitting, reviewing, and tracking academic proposals. Everything you need, nothing you don't.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              Trusted by <span className="text-white">thousands of students</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
