import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Users, 
  LogOut, 
  ChevronLeft, 
  GraduationCap,
  History
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

  const navGroups = [
    {
      title: 'Menu Utama',
      items: userRole === 'STUDENT'
        ? [
            { name: 'Dashboard', path: '/student', icon: FileText },
            { name: 'Riwayat Pengajuan', path: '/student/history', icon: History }
          ]
        : userRole === 'ADMIN'
        ? [{ name: 'Dashboard Admin', path: '/admin', icon: Users }]
        : [{ name: 'Antrean Validasi', path: '/validator', icon: CheckSquare }]
    },
    {
      title: 'Publik',
      items: [
        { name: 'Arsip Judul', path: '/submissions', icon: BookOpen }
      ]
    }
  ];

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
          <div className="bg-orange-600 p-1.5 rounded shadow-sm">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600 whitespace-nowrap">
            SkripsiHub
          </span>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white
            hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors
            ${!isOpen ? 'mx-auto' : ''}
          `}
        >
          {isOpen ? <ChevronLeft size={20} /> : <BookOpen size={24} className="text-orange-600" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-2">
            <h4 className={`px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {group.title}
            </h4>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    title={!isOpen ? item.name : undefined}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-600 rounded-r-full" />
                    )}
                    <item.icon size={20} className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                    <span className={`font-medium whitespace-nowrap transition-all duration-300 text-sm ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Logout Area */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          title={!isOpen ? "Log out" : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group
            text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm font-semibold
          `}
        >
          <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}
