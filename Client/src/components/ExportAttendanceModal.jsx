import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ExportAttendanceModal = ({ isOpen, onClose, user }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsExporting(true);
    try {
      const endpoint = (user.role === 'admin' || user.role === 'manager') ? '/attendance' : '/attendance/my';
      const { data } = await axios.get(`${endpoint}?startDate=${startDate}&endDate=${endDate}`);
      
      if (data.success && data.records.length > 0) {
        const exportData = data.records.map(r => ({
          'Date': new Date(r.date).toLocaleDateString(),
          'Employee Name': r.employee?.name || 'N/A',
          'Employee ID': r.employee?.employeeId || 'N/A',
          'Check In': r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          'Check Out': r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          'Working Hours': r.workingHours ? `${r.workingHours}h` : '0h',
          'Status': r.status.toUpperCase()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Set column widths for better look
        const wscols = [
          { wch: 15 }, // Date
          { wch: 25 }, // Employee Name
          { wch: 15 }, // Employee ID
          { wch: 15 }, // Check In
          { wch: 15 }, // Check Out
          { wch: 15 }, // Working Hours
          { wch: 12 }  // Status
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        
        const fileName = `Attendance_Report_${startDate}_to_${endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        toast.success('Excel file generated successfully!');
        onClose();
      } else {
        toast.error('No records found for this date range');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Export to Excel</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  From Date
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field py-3 dark:bg-slate-800 dark:border-slate-700" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  To Date
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field py-3 dark:bg-slate-800 dark:border-slate-700" 
                />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                Note: The export will include date, employee name, check-in/out times, and total working hours for all records within the selected range.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? 'Generating...' : 'Download Excel'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportAttendanceModal;
