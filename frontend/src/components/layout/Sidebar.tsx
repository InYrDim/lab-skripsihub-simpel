import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Users, 
  LogOut, 
  ChevronLeft, 
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role?.toUpperCase() || 'STUDENT';

  const navItems = [];
  if (userRole === 'STUDENT') {
    navItems.push({ name: 'Student Dashboard', path: '/student', icon: FileText });
  } else if (userRole === 'ADMIN') {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: Users });
  } else if (userRole === 'VALIDATOR') {
    navItems.push({ name: 'Validator Queue', path: '/validator', icon: CheckSquare });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72' : 'w-20'}
        bg-white dark:bg-zinc-950 
        border-r border-zinc-200 dark:border-zinc-800
        flex flex-col shadow-sm
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div 
          onClick={() => navigate('/')}
          className={`flex items-center gap-3 overflow-hidden transition-all duration-300 cursor-pointer ${isOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 whitespace-nowrap">
            SkripsiHub
          </span>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white
            hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors
            ${!isOpen ? 'mx-auto' : ''}
          `}
        >
          {isOpen ? <ChevronLeft size={20} /> : <BookOpen size={24} className="text-indigo-600" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'}
              `}
            >
              <item.icon size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 text-xs ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Logout Area */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
            text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold
          `}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}
