import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHomeClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = user.role.toUpperCase();
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'VALIDATOR') navigate('/validator');
    else navigate('/student');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">403 - Access Denied</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You do not have permission to access this page. Please return to your authorized portal.
        </p>
        <button
          onClick={handleHomeClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
