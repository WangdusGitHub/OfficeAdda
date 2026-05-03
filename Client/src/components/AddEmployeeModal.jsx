import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, User, Mail, Briefcase, IndianRupee, Shield, Camera, Loader2, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddEmployeeModal = ({ onClose, onSuccess, employee }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    role: 'employee',
    salary: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        designation: employee.designation || '',
        role: employee.role,
        salary: employee.salary || '',
        department: employee.department?._id || employee.department || '',
      });
      setPreview(employee.profilePicture);
    }
    fetchDepartments();
  }, [employee]);

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get('/departments');
      if (data.success) setDepartments(data.departments);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let res;
      if (employee) {
        res = await axios.put(`/employees/${employee._id}`, formData);
      } else {
        res = await axios.post('/employees', formData);
      }

      if (res.data.success && image) {
        const uploadData = new FormData();
        uploadData.append('profilePicture', image);
        await axios.post(`/employees/${res.data.employee._id}/profile-picture`, uploadData);
      }

      toast.success(employee ? 'Updated successfully' : 'Added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="card w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{employee ? 'Edit' : 'Add'} Employee</h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col items-center gap-3 mb-1">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {preview
                  ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  : <Camera className="w-6 h-6 text-slate-400" />
                }
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                <span className="text-white text-xs font-semibold">Change</span>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-slate-400">Profile picture (max 5 MB)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field pl-9 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="input-field pl-9 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Designation</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Software Engineer"
                  className="input-field pl-9 py-2"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Monthly Salary (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  placeholder="50000"
                  className="input-field pl-9 py-2"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="input-field pl-9 py-2 appearance-none"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">System Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="input-field pl-9 py-2 appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-2">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (employee ? 'Update Employee' : 'Add Employee')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddEmployeeModal;
