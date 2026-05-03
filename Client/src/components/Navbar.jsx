import { Search, Moon, Sun, Menu } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="
      h-[60px] bg-white dark:bg-[#0d0f12]
      border-b border-slate-200 dark:border-slate-800/80
      fixed top-0 right-0 left-0 lg:left-[220px] z-30
      flex items-center justify-between px-4 md:px-6
      transition-all duration-300
    ">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className="lg:hidden btn-icon"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="
              w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none
              bg-slate-50 border border-slate-200
              placeholder:text-slate-400 text-slate-700
              focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20
              dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200
              dark:placeholder:text-slate-500
              dark:focus:bg-slate-800 dark:focus:border-primary-500
              transition-all duration-150
            "
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="btn-icon"
          aria-label="Toggle theme"
        >
          {darkMode
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        <NotificationDropdown />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
