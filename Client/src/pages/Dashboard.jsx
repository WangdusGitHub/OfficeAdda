import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarClock,
  FileCheck2,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AttendanceCard from '../components/AttendanceCard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/* ── Stat Card ───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, trend, trendValue, accent }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.15 }}
    className="stat-card"
  >
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {trendValue}%
      </span>
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  </motion.div>
);

/* ── Tooltip ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-0.5">{label}</p>
      <p className="text-primary-600 dark:text-primary-400">{payload[0].value}% attendance</p>
    </div>
  );
};

/* ── Dashboard ───────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    avgAttendance: 0,
    activeLeaves: 0,
    totalDepartments: 0,
    attendanceTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => { fetchStats(); }, [trendDays]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`/dashboard/stats?days=${trendDays}`);
      if (data.success) setStats(data.stats);
    } catch {
      toast.error('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const leaveDistribution = [
    { name: 'Sick',    value: 40, color: '#6366f1' },
    { name: 'Casual',  value: 30, color: '#8b5cf6' },
    { name: 'Annual',  value: 20, color: '#a78bfa' },
    { name: 'Others',  value: 10, color: '#c4b5fd' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time organisational metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary text-xs py-1.5 px-3">Overview</button>
          <button className="btn-secondary text-xs py-1.5 px-3">Reports</button>
        </div>
      </div>

      {/* Attendance punch card */}
      <AttendanceCard />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Employees"  value={stats.totalEmployees}           trend="up"   trendValue="12"  accent="bg-primary-600" />
        <StatCard icon={CalendarClock} label="Avg. Attendance" value={`${stats.avgAttendance}%`}      trend="up"   trendValue="2.4" accent="bg-blue-500" />
        <StatCard icon={FileCheck2}  label="Active Leaves"   value={stats.activeLeaves}              trend="down" trendValue="15"  accent="bg-violet-500" />
        <StatCard icon={Briefcase}   label="Departments"     value={stats.totalDepartments}          trend="up"   trendValue="0"   accent="bg-indigo-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Attendance Trends</h2>
              <p className="text-xs text-slate-400 mt-0.5">Weekly check-in rate</p>
            </div>
            <select 
              value={trendDays}
              onChange={(e) => setTrendDays(parseInt(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 dark:text-slate-300 outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.attendanceTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-5">Leave Distribution</h2>
          <div className="relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={75}
                  paddingAngle={4} dataKey="value"
                  startAngle={90} endAngle={-270}
                >
                  {leaveDistribution.map((e, i) => (
                    <Cell key={i} fill={e.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800 dark:text-white">45</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {leaveDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
