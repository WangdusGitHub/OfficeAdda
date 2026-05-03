import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar, Clock, MapPin, Filter, FileSpreadsheet,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ExportAttendanceModal from '../components/ExportAttendanceModal';

const statusClass = (s) => ({
  present:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  absent:   'bg-rose-50   text-rose-600   dark:bg-rose-500/10   dark:text-rose-400',
  late:     'bg-amber-50  text-amber-600  dark:bg-amber-500/10  dark:text-amber-400',
  'on-leave':'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
}[s] ?? 'bg-slate-100 text-slate-500');

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [records, setRecords]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState(new Date().getMonth() + 1);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filtered = records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
  });

  useEffect(() => { fetchRecords(); }, [month, year]);

  const fetchRecords = async () => {
    setLoading(true); setRecords([]); setSummary(null);
    try {
      const ep = (user.role === 'admin' || user.role === 'manager') ? '/attendance' : '/attendance/my';
      const { data } = await axios.get(`${ep}?month=${month}&year=${year}`);
      if (data.success) { setRecords(data.records || []); setSummary(data.summary || null); }
    } catch { console.error('Failed to fetch records'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Log</h1>
          <p className="page-subtitle">Review daily check-ins and monthly working hours.</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button onClick={() => setIsExportOpen(true)} className="btn-primary">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        )}
      </div>

      {/* Filters + summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Period selector */}
        <div className="lg:col-span-4 card p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter Period
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select className="select-field py-2 text-sm" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>
            <select className="select-field py-2 text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Summary chips */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summary ? [
            { label: 'Present',       value: summary.present,           icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Absent',        value: summary.absent,            icon: XCircle,      color: 'text-rose-500    dark:text-rose-400' },
            { label: 'Late',          value: summary.late,              icon: AlertCircle,  color: 'text-amber-500   dark:text-amber-400' },
            { label: 'Working Hours', value: `${summary.totalWorkingHours}h`, icon: Clock, color: 'text-primary-600  dark:text-primary-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          )) : (
            <div className="col-span-4 h-24 card animate-pulse" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                )}
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filtered.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                    {new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' })}
                  </td>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                          {record.employee?.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{record.employee?.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      {record.workingHours ? `${record.workingHours}h` : '0h'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge ${statusClass(record.status)} capitalize`}>{record.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {record.location ? (
                      <button className="btn-icon text-primary-600 dark:text-primary-400">
                        <MapPin className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No entries recorded</p>
            <p className="text-xs text-slate-400 mt-1">No attendance data for the selected period.</p>
          </div>
        )}
      </div>

      <ExportAttendanceModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} user={user} />
    </div>
  );
};

export default AttendanceHistory;
