import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
import Department from "../models/Department.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments({ isActive: true });

    // 2. Avg Attendance (Today)
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
      status: "present"
    });
    const avgAttendance = totalEmployees > 0 ? ((todayAttendance / totalEmployees) * 100).toFixed(1) : 0;

    // 3. Active Leaves (Today)
    const activeLeaves = await Leave.countDocuments({
      status: "approved",
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // 4. Total Departments
    const totalDepartments = await Department.countDocuments({ isActive: true });

    // 5. Recent Attendance Trends
    const days = parseInt(req.query.days) || 7;
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = await Attendance.countDocuments({
        date: { $gte: d, $lt: nextD },
        status: "present"
      });
      
      const percentage = totalEmployees > 0 ? (count / totalEmployees) * 100 : 0;
      
      const dayLabel = days <= 7 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      trends.push({
        day: dayLabel,
        value: Math.round(percentage)
      });
    }

    res.json({
      success: true,
      stats: {
        totalEmployees,
        avgAttendance,
        activeLeaves,
        totalDepartments,
        attendanceTrends: trends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
