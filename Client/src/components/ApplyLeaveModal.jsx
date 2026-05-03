import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, Calendar, AlignLeft, Info, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ApplyLeaveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post('/leaves', formData);
      if (data.success) {
        toast.success('Application submitted successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Apply for Leave</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Leave Type</label>
            <div className="relative">
              <Info className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <select 
                className="input-field pl-12 appearance-none"
                value={formData.leaveType}
                onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="maternity">Maternity/Paternity</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="date" 
                  className="input-field pl-12"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="date" 
                  className="input-field pl-12"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Reason for Leave</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <textarea 
                placeholder="Briefly explain the reason for your application..."
                className="input-field pl-12 min-h-[100px] pt-3 resize-none"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApplyLeaveModal;
