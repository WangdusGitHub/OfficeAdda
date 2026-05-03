import Payroll from "../models/Payroll.model.js";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendance.model.js";
import Notification from "../models/Notification.model.js";

// @desc    Generate payroll for an employee or all active employees
// @route   POST /api/payroll/generate
// @access  Admin
export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, allowances, deductions, bonus } = req.body;

    let employeesToProcess = [];
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
      employeesToProcess.push(employee);
    } else {
      // If no specific employee is provided, generate for all active employees
      employeesToProcess = await Employee.find({ isActive: true });
    }

    const generatedPayrolls = [];

    for (const employee of employeesToProcess) {
      // Prevent duplicate payroll generation for the same month
      const existing = await Payroll.findOne({ employee: employee._id, month, year });
      if (existing) continue;

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: { $gte: start, $lte: end },
      });

      const presentDays = attendanceRecords.filter((r) =>
        ["present", "late", "half-day", "on-leave"].includes(r.status)
      ).length;
      const workingDays = new Date(year, month, 0).getDate();

      // Calculate total working hours based on attendance
      let totalWorkedHours = 0;
      for (const r of attendanceRecords) {
        if (r.workingHours > 0) {
          totalWorkedHours += r.workingHours;
        } else {
          // Fallbacks if checkout wasn't done or they were on leave
          if (r.status === "present" || r.status === "on-leave") totalWorkedHours += 9;
          else if (r.status === "half-day") totalWorkedHours += 4.5;
          else if (r.status === "late") totalWorkedHours += 8;
        }
      }

      // 9 hours per day expected
      const expectedTotalHours = workingDays * 9;
      const baseSalary = employee.salary || 0;
      const perHourSalary = baseSalary / expectedTotalHours;
      const earnedSalary = totalWorkedHours * perHourSalary;

      let dynamicAllowances = { ...allowances };
      let dynamicDeductions = { ...deductions };

      if (earnedSalary > baseSalary) {
        dynamicAllowances.other = (dynamicAllowances.other || 0) + parseFloat((earnedSalary - baseSalary).toFixed(2));
      } else if (earnedSalary < baseSalary) {
        dynamicDeductions.leavePenalty = (dynamicDeductions.leavePenalty || 0) + parseFloat((baseSalary - earnedSalary).toFixed(2));
      }

      const payroll = await Payroll.create({
        employee: employee._id,
        month,
        year,
        basicSalary: baseSalary,
        allowances: dynamicAllowances,
        deductions: dynamicDeductions,
        bonus: bonus || 0,
        workingDays,
        presentDays,
        generatedBy: req.user._id,
      });

      generatedPayrolls.push(payroll);

      if (employee.user) {
        await Notification.create({
          recipient: employee.user,
          sender: req.user._id,
          type: "payroll",
          title: "Payslip Generated",
          message: `Your payslip for ${month}/${year} has been generated. Net Salary: ₹${payroll.netSalary}`,
          link: `/payroll/${payroll._id}`,
        });

        req.app.get("io").to(employee.user.toString()).emit("notification", {
          title: "Payslip Generated",
          message: `Net Salary: ₹${payroll.netSalary}`,
        });
      }
    }

    res.status(201).json({ success: true, count: generatedPayrolls.length, payrolls: generatedPayrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my payslips
// @route   GET /api/payroll/my
// @access  Employee
export const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const payslips = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Admin
export const getAllPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const payrolls = await Payroll.find(query)
      .populate("employee", "name employeeId department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payrolls.length, payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/pay
// @access  Admin
export const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "paid", paidAt: new Date() },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });
    res.json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
