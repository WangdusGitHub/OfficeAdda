import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  FileText, 
  Upload, 
  Download, 
  Trash2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const { data } = await axios.get(`/employees/${id}`);
      if (data.success) {
        setEmployee(data.employee);
      }
    } catch (error) {
      toast.error('Employee not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const { data } = await axios.post(`/employees/${id}/documents`, formData);
      if (data.success) {
        toast.success('Document uploaded successfully');
        fetchEmployee();
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/employees" className="btn-icon">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="page-title">Employee Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mx-auto mb-5 overflow-hidden flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
              {employee.profilePicture ? (
                <img src={employee.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{employee.name}</h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-0.5">{employee.designation || 'Specialist'}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {employee.employeeId}
              </span>
              <span className={`badge ${employee.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-primary-500" /> Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">{employee.phone || '+91 00000 00000'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">{employee.address || 'Address not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info & Documents */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary-500" /> Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{employee.department?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Joining Date</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                  {new Date(employee.joiningDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Monthly Salary</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{employee.salary?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Reports To</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{employee.manager?.name || 'Direct Admin'}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" /> Documents Vault
              </h3>
              <label className={`
                btn-primary py-1.5 px-3 text-xs cursor-pointer
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload New
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            <div className="space-y-3">
              {employee.documents?.length === 0 ? (
                <div className="py-10 text-center card border-dashed">
                  <p className="text-slate-400 text-xs">No documents uploaded yet.</p>
                </div>
              ) : (
                employee.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-icon"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a 
                        href={doc.url} 
                        download 
                        className="btn-icon"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
