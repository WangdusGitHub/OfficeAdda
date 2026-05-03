import Leave from "../models/Leave.model.js";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendance.model.js";
import Notification from "../models/Notification.model.js";

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Employee
export const applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(400).json({ 
        success: false, 
        message: "You must have an employee profile to apply for leave. Admins cannot apply for leave directly." 
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    const totalDays = Math.ceil(diff) + 1;

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    // Notify manager
    if (employee.manager) {
      const managerEmployee = await Employee.findById(employee.manager).populate("user");
      await Notification.create({
        recipient: managerEmployee.user._id,
        sender: req.user._id,
        type: "leave",
        title: "New Leave Request",
        message: `${employee.name} has applied for ${leaveType} leave from ${startDate} to ${endDate}`,
        link: `/leaves/${leave._id}`,
      });

      const io = req.app.get("io");
      io.to(managerEmployee.user._id.toString()).emit("notification", {
        title: "New Leave Request",
        message: `${employee.name} applied for leave`,
      });
    }

    res.status(201).json({ success: true, leave });
  } catch (error) {
    console.error("Error in applyLeave:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my leave applications
// @route   GET /api/leaves/my
// @access  Employee
export const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const leaves = await Leave.find({ employee: employee._id })
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Error in getMyLeaves:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave applications (Admin/Manager)
// @route   GET /api/leaves
// @access  Admin, Manager
export const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const leaves = await Leave.find(query)
      .populate("employee", "name employeeId department role")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error("Error in getAllLeaves:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject leave
// @route   PUT /api/leaves/:id/status
// @access  Admin, Manager
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id).populate("employee");
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    // Security block: Managers cannot approve manager/admin leaves
    if (req.user.role === "manager" && (leave.employee.role === "manager" || leave.employee.role === "admin")) {
      return res.status(403).json({ success: false, message: "Managers cannot approve leaves for other managers or admins." });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    // If approved, mark attendance as "on-leave" for those days
    if (status === "approved") {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: day },
          { status: "on-leave" },
          { upsert: true }
        );
      }
    }

    // Notify employee
    const employeeUser = await Employee.findById(leave.employee._id).populate("user");
    await Notification.create({
      recipient: employeeUser.user._id,
      sender: req.user._id,
      type: "leave",
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your leave request has been ${status}`,
      link: `/leaves/${leave._id}`,
    });

    const io = req.app.get("io");
    io.to(employeeUser.user._id.toString()).emit("notification", {
      title: `Leave ${status}`,
      message: `Your leave request has been ${status}`,
    });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
