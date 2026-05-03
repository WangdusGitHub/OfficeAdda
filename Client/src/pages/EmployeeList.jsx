import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Users, Mail, Briefcase, Trash2, Edit3, ExternalLink, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { useAuth } from '../context/AuthContext';

const roleBadge = (role) => ({
  admin:    'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  manager:  'bg-amber-50  text-amber-600  dark:bg-amber-500/10  dark:text-amber-400',
  employee: 'bg-slate-100 text-slate-600  dark:bg-slate-700     dark:text-slate-300',
}[role] ?? 'bg-slate-100 text-slate-600');

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterRole, setFilterRole]       = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [departments, setDepartments]     = useState([]);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => { fetchEmployees(); }, [search, filterRole, filterDept]);
  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get('/departments');
      if (data.success) setDepartments(data.departments);
    } catch {}
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`/employees?search=${search}&role=${filterRole}&department=${filterDept}`);
      if (data.success) setEmployees(data.employees);
    } catch { toast.error('Failed to fetch employees'); }
    finally  { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    try {
      await axios.delete(`/employees/${id}`);
      toast.success('Employee deactivated');
      fetchEmployees();
    } catch { toast.error('Deletion failed'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage your team members and their roles.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="table-container">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employees…"
              className="input-field pl-9 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="select-field py-2 text-sm w-auto pl-3 pr-8"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select
              className="select-field py-2 text-sm w-auto pl-3 pr-8"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            {(search || filterRole || filterDept) && (
              <button
                onClick={() => { setSearch(''); setFilterRole(''); setFilterDept(''); }}
                className="btn-secondary py-2 text-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                {user?.role === 'admin' && (
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              <AnimatePresence>
                {employees.map((emp) => (
                  <motion.tr
                    key={emp._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <Link to={`/employees/${emp._id}`} className="flex items-center gap-3 group/link">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-semibold text-xs uppercase shrink-0 overflow-hidden">
                          {emp.profilePicture
                            ? <img src={emp.profilePicture} alt="" className="w-full h-full object-cover" />
                            : emp.name.charAt(0)
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 transition-colors flex items-center gap-1">
                            {emp.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />{emp.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {emp.designation || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${roleBadge(emp.role)}`}>{emp.role}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      ₹{emp.salary?.toLocaleString() || '0'}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsModalOpen(true); }}
                            className="btn-icon text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && employees.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No employees found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchEmployees}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeList;
