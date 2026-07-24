import { Bell, Menu, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      
      {/* Left side: Mobile menu toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={20} />
        </button>

      </div>

      {/* Right side: User profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button className="relative p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white dark:border-zinc-950"></span>
        </button>
        
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
              {user?.role || 'STUDENT'}
            </span>
          </div>

          <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <UserIcon size={18} />
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </header>
  );
}
