import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle2, LogOut, Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AttendanceCard = () => {
  const [attendance, setAttendance]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const { data } = await axios.get('/attendance/my');
      if (data.success && data.records.length > 0) {
        const today = new Date().toLocaleDateString('en-CA');
        const rec   = data.records.find(r => new Date(r.date).toLocaleDateString('en-CA') === today);
        setAttendance(rec);
      }
    } catch { console.error('Failed to fetch attendance'); }
    finally  { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const { data } = await axios.post('/attendance/checkin', {
          latitude: coords.latitude, longitude: coords.longitude,
        });
        if (data.success) { setAttendance(data.attendance); toast.success('Checked in!'); }
      } catch (e) { toast.error(e.response?.data?.message || 'Check-in failed'); }
      finally { setActionLoading(false); }
    }, () => { toast.error('Location access denied.'); setActionLoading(false); });
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const { data } = await axios.put('/attendance/checkout');
      if (data.success) { setAttendance(data.attendance); toast.success('Checked out!'); }
    } catch (e) { toast.error(e.response?.data?.message || 'Check-out failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="card h-[100px] animate-pulse" />
  );

  const isCheckedIn  = attendance?.checkIn && !attendance?.checkOut;
  const isCheckedOut = attendance?.checkIn && attendance?.checkOut;

  /* status pill */
  const statusPill = isCheckedIn
    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    : isCheckedOut
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  const statusLabel = isCheckedIn ? 'In Progress' : isCheckedOut ? 'Completed' : 'Not Started';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Time + date */}
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            isCheckedIn  ? 'bg-amber-100  dark:bg-amber-500/10  text-amber-600  dark:text-amber-400' :
            isCheckedOut ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                           'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`badge ${statusPill} text-xs`}>{statusLabel}</span>

          {!attendance?.checkIn && (
            <button onClick={handleCheckIn} disabled={actionLoading} className="btn-primary">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Punch In
            </button>
          )}
          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl border border-rose-600/40 shadow-sm transition-all active:scale-[.98]"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Punch Out
            </button>
          )}
          {isCheckedOut && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Done for today
            </div>
          )}
        </div>
      </div>

      {/* Punch times */}
      {(attendance?.checkIn || attendance?.checkOut) && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
          {[
            { label: 'Punch In',  time: attendance.checkIn  },
            { label: 'Punch Out', time: attendance.checkOut },
          ].map(({ label, time }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceCard;
