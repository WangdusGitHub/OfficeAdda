import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText, 
  CreditCard, 
  Award,
  MessageSquare,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/' },
    { icon: Users,           label: 'Employees',     path: '/employees',   roles: ['admin', 'manager'] },
    { icon: Building2,       label: 'Departments',   path: '/departments', roles: ['admin', 'manager'] },
    { icon: CalendarCheck,   label: 'Attendance',    path: '/attendance' },
    { icon: FileText,        label: 'Leave Requests',path: '/leaves' },
    { icon: CreditCard,      label: 'Payroll',       path: '/payroll',     roles: ['admin'] },
    { icon: Award,           label: 'Performance',   path: '/performance' },
    { icon: MessageSquare,   label: 'Staff Chat',    path: '/chat' },
  ];

  const filtered = menuItems.filter(i => !i.roles || i.roles.includes(user?.role));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        w-[220px] h-screen flex flex-col fixed left-0 top-0 z-40
        bg-white dark:bg-[#0d0f12]
        border-r border-slate-200 dark:border-slate-800/80
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="relative w-40 h-full flex items-center">
            <img src="/logo-light.png" alt="OfficeAdda" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[144px] max-w-none dark:hidden mix-blend-multiply pointer-events-none" />
            <img src="/logo-dark.png" alt="OfficeAdda" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[144px] max-w-none hidden dark:block mix-blend-screen pointer-events-none" />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden btn-icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {filtered.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 px-3 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
