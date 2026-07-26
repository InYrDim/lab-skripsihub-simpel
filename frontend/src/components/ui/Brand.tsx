import React from 'react';
import { GraduationCap } from 'lucide-react';

interface BrandProps {
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Brand({ isCollapsed = false, onClick, className = '' }: BrandProps) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'} ${className}`}
    >
      <div className="bg-orange-600 p-1.5 rounded shadow-sm shrink-0">
        <GraduationCap className="text-white w-6 h-6" />
      </div>
      <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600 whitespace-nowrap">
        SkripsiHub
      </span>
    </div>
  );
}
