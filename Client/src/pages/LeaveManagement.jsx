import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Check, X, Clock, Calendar, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ApplyLeaveModal from '../components/ApplyLeaveModal';

const statusClass = (s) => ({
  approved: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  rejected: 'bg-rose-50   text-rose-600   dark:bg-rose-500/10   dark:text-rose-400',
  pending:  'bg-amber-50  text-amber-600  dark:bg-amber-500/10  dark:text-amber-400',
}[s] ?? 'bg-slate-100 text-slate-500');

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const ep = (user.role === 'admin' || user.role === 'manager') ? '/leaves' : '/leaves/my';
      const { data } = await axios.get(ep);
      if (data.success) setLeaves(data.leaves);
    } catch { toast.error('Failed to fetch leave requests'); }
    finally   { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/leaves/${id}/status`, { status });
      if (data.success) { toast.success(`Leave ${status}`); fetchLeaves(); }
    } catch { toast.error('Failed to update status'); }
  };

  const pending  = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">
            {user.role === 'employee'
              ? 'Track your leave history and applications.'
              : 'Review and manage team leave requests.'}
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Casual Leave',     value: '12 / 15 days', color: 'text-slate-800 dark:text-white' },
          { label: 'Sick Leave',       value: '8 / 10 days',  color: 'text-slate-800 dark:text-white' },
          { label: 'Pending Approval', value: `${pending} requests`,   color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Approved Leaves',  value: `${approved} total`,     color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(c => (
          <div key={c.label} className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Applications</h2>
          <div className="flex gap-1">
            <button className="btn-icon"><Calendar className="w-4 h-4" /></button>
            <button className="btn-icon"><FileText className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                        {leave.employee?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{leave.employee?.name || 'Your Request'}</p>
                        <p className="text-xs text-slate-400 capitalize">{leave.leaveType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400 capitalize">{leave.leaveType}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-200 text-xs">
                      {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />{leave.totalDays} days
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge ${statusClass(leave.status)} capitalize`}>{leave.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {(user.role === 'admin' ||
                      (user.role === 'manager' &&
                       leave.employee?.role !== 'manager' &&
                       leave.employee?.role !== 'admin')) &&
                     leave.status === 'pending' ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleUpdateStatus(leave._id, 'approved')}
                          className="btn-icon text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button className="btn-icon"><MoreVertical className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && leaves.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No requests found</p>
            <p className="text-xs text-slate-400 mt-1">There are no leave applications to display.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ApplyLeaveModal onClose={() => setIsModalOpen(false)} onSuccess={fetchLeaves} />
      )}
    </div>
  );
};

export default LeaveManagement;
