import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Plus, Users, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddDepartmentModal from '../components/AddDepartmentModal';
import { useAuth } from '../context/AuthContext';

const DepartmentList = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get('/departments');
      if (data.success) setDepartments(data.departments);
    } catch { toast.error('Failed to fetch departments'); }
    finally  { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Employees will be unassigned.')) return;
    try {
      await axios.delete(`/departments/${id}`);
      toast.success('Department removed');
      fetchDepartments();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage organisational units and team structures.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => { setSelectedDept(null); setIsModalOpen(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Department
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <motion.div
            key={dept._id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="card p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {user?.role === 'admin' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setSelectedDept(dept); setIsModalOpen(true); }}
                    className="btn-icon text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="btn-icon text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-white">{dept.name}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
              {dept.description || 'No description provided.'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{dept.employeeCount || 0} employees</span>
              </div>
              {(dept.avatars || []).length > 0 && (
                <div className="flex -space-x-1.5">
                  {dept.avatars.slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {!loading && departments.length === 0 && (
          <div className="col-span-full py-20 text-center card border-dashed">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No departments yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first organisational unit.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddDepartmentModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDepartments}
          department={selectedDept}
        />
      )}
    </div>
  );
};

export default DepartmentList;
