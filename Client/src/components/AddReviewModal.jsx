import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, Star, User, MessageCircle, Target, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AddReviewModal = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    rating: 5,
    feedback: '',
    goals: [''],
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/employees');
      if (data.success) {
        let eligible = data.employees;
        
        if (user?.role === 'manager') {
          // Find manager's own employee record to get their department
          const managerProfile = data.employees.find(e => e.email === user.email);
          if (managerProfile && managerProfile.department) {
            const managerDeptId = managerProfile.department._id || managerProfile.department;
            // Managers can only rate 'employees' in their own department
            eligible = data.employees.filter(e => {
              const eDeptId = e.department?._id || e.department;
              return eDeptId === managerDeptId && e.role === 'employee';
            });
          } else {
            eligible = [];
          }
        } else if (user?.role === 'admin') {
          // Admins can rate managers and employees
          eligible = data.employees.filter(e => e.role === 'manager' || e.role === 'employee');
        } else {
          // Standard employees cannot rate anyone
          eligible = [];
        }
        
        setEmployees(eligible);
      }
    } catch (error) {
      toast.error('Failed to fetch employee list');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) return toast.error('Please select an employee');
    
    setLoading(true);
    try {
      const { data } = await axios.post('/performance', {
        ...formData,
        goals: formData.goals.filter(g => g.trim() !== '')
      });
      if (data.success) {
        toast.success('Performance review submitted!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoalField = () => {
    setFormData({ ...formData, goals: [...formData.goals, ''] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Performance Evaluation</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Select Staff Member</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <select 
                className="input-field pl-12 appearance-none"
                value={formData.employee}
                onChange={(e) => setFormData({...formData, employee: e.target.value})}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({...formData, rating: num})}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 flex flex-col items-center gap-1 ${
                    formData.rating >= num 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-600 dark:text-amber-400' 
                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'
                  }`}
                >
                  <Star className={`w-5 h-5 ${formData.rating >= num ? 'fill-current' : ''}`} />
                  <span className="text-xs">{num}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Performance Feedback</label>
            <div className="relative">
              <MessageCircle className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <textarea 
                placeholder="Detail the employee's strengths and areas for improvement..."
                className="input-field pl-12 min-h-[120px] pt-3 resize-none"
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex justify-between items-center">
              Next Quarter Goals
              <button 
                type="button" 
                onClick={addGoalField}
                className="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline"
              >
                + Add Goal
              </button>
            </label>
            {formData.goals.map((goal, idx) => (
              <div key={idx} className="relative">
                <Target className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={`Goal #${idx + 1}...`}
                  className="input-field pl-12 py-3"
                  value={goal}
                  onChange={(e) => updateGoal(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddReviewModal;
