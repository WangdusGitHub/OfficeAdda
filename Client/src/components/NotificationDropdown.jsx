import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen]    = useState(false);
  const { notifications, markAsRead } = useSocket();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 card shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="badge bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    {notifications.length} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Info className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="opacity-0 group-hover:opacity-100 btn-icon text-emerald-500 p-1 transition-opacity"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button className="w-full py-2.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-t border-slate-100 dark:border-slate-800">
                View all activity
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
