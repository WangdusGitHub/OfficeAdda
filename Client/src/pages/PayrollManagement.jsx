import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  IndianRupee, 
  CheckCircle2, 
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PayrollManagement = () => {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const fetchPayroll = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/payroll' : '/payroll/my';
      const { data } = await axios.get(`${endpoint}?month=${month}&year=${year}`);
      if (data.success) {
        setPayroll(data.payrolls || data.payslips || []);
      }
    } catch (error) {
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      const { data } = await axios.put(`/payroll/${id}/pay`);
      if (data.success) {
        toast.success('Payment processed successfully');
        fetchPayroll();
      }
    } catch (error) {
      toast.error('Payment processing failed');
    }
  };

  const generatePayroll = async () => {
    if (!window.confirm(`Generate payroll for ${new Date(0, month - 1).toLocaleString('en', { month: 'long' })} ${year}?`)) return;
    
    try {
      const { data } = await axios.post('/payroll/generate', { month, year });
      if (data.success) {
        toast.success('Payroll generated for all employees');
        fetchPayroll();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed');
    }
  };

  const downloadExcel = async (payRecord) => {
    try {
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const { data } = await axios.get(`/attendance?employeeId=${payRecord.employee._id}&startDate=${start}&endDate=${end}`);
      
      if (data.success) {
        const records = data.records;
        
        let csvContent = "Date,Check In,Check Out,Status,Working Hours\n";
        
        // Ensure we cover all days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const currentDate = new Date(year, month - 1, i);
          const dateStr = currentDate.toLocaleDateString();
          
          // Find if there is an attendance record for this day
          const record = records.find(r => new Date(r.date).getDate() === i);
          
          if (record) {
            const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A';
            const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A';
            csvContent += `"${dateStr}","${checkIn}","${checkOut}","${record.status.toUpperCase()}","${record.workingHours || 0}"\n`;
          } else {
             // If it's a weekend, maybe note it, but by default mark as absent/no record
             const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
             csvContent += `"${dateStr}","N/A","N/A","${isWeekend ? 'WEEKEND' : 'ABSENT'}","0"\n`;
          }
        }
        
        // Add Summary Rows at the bottom
        csvContent += `\nSUMMARY\n`;
        csvContent += `Employee Name,"${payRecord.employee.name}"\n`;
        csvContent += `Base Salary,"Rs. ${payRecord.basicSalary}"\n`;
        csvContent += `Total Net Salary,"Rs. ${payRecord.netSalary}"\n`;
        
        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${payRecord.employee.name}_Timesheet_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error("Failed to generate Excel report");
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll System</h1>
          <p className="page-subtitle">Manage employee compensation and generate payslips.</p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={generatePayroll}
            className="btn-primary"
          >
            <Wallet className="w-4 h-4" />
            Generate Monthly Payroll
          </button>
        )}
      </div>

      <div className="card p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto">
          <select className="select-field py-2 flex-1 md:w-32" value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
          <select className="select-field py-2 flex-1 md:w-28" value={year} onChange={(e) => setYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex gap-4 sm:gap-8 w-full md:w-auto justify-between md:justify-end">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Payout</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">
              ₹{(payroll || []).reduce((acc, curr) => acc + (curr.netSalary || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Paid</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {(payroll || []).filter(p => p.paymentStatus === 'paid').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pending</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {(payroll || []).filter(p => p.paymentStatus === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Allowances</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deductions</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {(payroll || []).map((pay) => (
                <tr key={pay._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase shrink-0">
                        {pay.employee?.name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{pay.employee?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {pay.employee?.employeeId || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-400">₹{(pay.basicSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400 font-medium">+₹{(pay.totalAllowances || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-rose-500 dark:text-rose-400 font-medium">-₹{(pay.totalDeductions || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200">₹{(pay.netSalary || 0).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className={`badge uppercase ${
                      pay.paymentStatus === 'paid' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {pay.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {user.role === 'admin' && pay.paymentStatus === 'pending' && (
                        <button 
                          onClick={() => handleProcessPayment(pay._id)}
                          className="btn-secondary py-1 text-xs"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button className="btn-icon">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(payroll || []).length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No payroll records</p>
            <p className="text-xs text-slate-400 mt-1">Payroll hasn't been generated for this month yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollManagement;
