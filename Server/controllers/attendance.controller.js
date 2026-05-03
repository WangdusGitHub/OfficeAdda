import Attendance from "../models/Attendance.model.js";
import Employee from "../models/Employee.model.js";

// @desc    Check In
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
export const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      console.error(`❌ Check-in failed: No employee profile for user ${req.user._id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Check-in failed: You must have an employee profile to record attendance. Admins without profiles cannot punch in." 
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({ 
      employee: employee._id, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });
    
    if (existing?.checkIn) {
      return res.status(400).json({ success: false, message: "Already checked in today" });
    }

    const { latitude, longitude } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { employee: employee._id, date: { $gte: startOfDay, $lte: endOfDay } },
      {
        checkIn: new Date(),
        date: startOfDay, // Ensure we store the start of day for consistency
        status: "present",
        ...(latitude && longitude ? { location: { latitude, longitude } } : {}),
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: "Checked in successfully", attendance });
  } catch (error) {
    console.error("🔥 Error in checkIn:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check Out
// @route   PUT /api/attendance/checkout
// @access  Private (Employee)
export const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      console.error(`❌ Check-out failed: No employee profile for user ${req.user._id}`);
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({ 
      employee: employee._id, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });
    
    if (!attendance?.checkIn) {
      return res.status(400).json({ success: false, message: "No check-in found for today" });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: "Already checked out today" });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({ success: true, message: "Checked out successfully", attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance (monthly)
// @route   GET /api/attendance/my?month=4&year=2024
// @access  Private
export const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(200).json({ 
        success: true, 
        records: [], 
        summary: { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0, totalWorkingHours: "0.00" } 
      });
    }

    let start, end;
    if (req.query.startDate && req.query.endDate) {
      start = new Date(req.query.startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);
    }

    const records = await Attendance.find({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const summary = {
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      halfDay: records.filter((r) => r.status === "half-day").length,
      onLeave: records.filter((r) => r.status === "on-leave").length,
      totalWorkingHours: records.reduce((sum, r) => sum + (r.workingHours || 0), 0).toFixed(2),
    };

    res.json({ success: true, records, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance (Admin/Manager)
// @route   GET /api/attendance?date=2024-04-29
// @access  Admin, Manager
export const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const query = {};

    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59);
      query.date = { $gte: d, $lte: end };
    } else if (req.query.month || req.query.year) {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    if (employeeId) query.employee = employeeId;

    const records = await Attendance.find(query)
      .populate("employee", "name employeeId department")
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance manually (Admin)
// @route   POST /api/attendance/mark
// @access  Admin
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, notes } = req.body;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: d },
      { status, notes },
      { upsert: true, new: true }
    );
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
