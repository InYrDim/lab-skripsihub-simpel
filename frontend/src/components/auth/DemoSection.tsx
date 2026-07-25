import React from 'react';
import { UserCheck, ShieldCheck, FileCheck } from 'lucide-react';

interface DemoSectionProps {
  onDemoLogin: (role: 'STUDENT' | 'ADMIN' | 'VALIDATOR') => void;
}

export const DemoSection: React.FC<DemoSectionProps> = ({ onDemoLogin }) => {
  return (
    <div className="pt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-zinc-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
            Demo Accounts (Development Mode)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <button
          type="button"
          onClick={() => onDemoLogin('STUDENT')}
          className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-orange-200 hover:bg-orange-50 text-zinc-600 transition-all group"
        >
          <UserCheck size={20} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Student</span>
        </button>

        <button
          type="button"
          onClick={() => onDemoLogin('ADMIN')}
          className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-blue-200 hover:bg-blue-50 text-zinc-600 transition-all group"
        >
          <ShieldCheck size={20} className="text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Admin</span>
        </button>

        <button
          type="button"
          onClick={() => onDemoLogin('VALIDATOR')}
          className="flex flex-col items-center justify-center p-3 rounded border-2 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 text-zinc-600 transition-all group"
        >
          <FileCheck size={20} className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Validator</span>
        </button>
      </div>
    </div>
  );
};
