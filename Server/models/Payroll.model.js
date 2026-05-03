import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      leavePenalty: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    bonus: { type: Number, default: 0 },
    totalAllowances: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    grossSalary: { type: Number },
    netSalary: { type: Number },
    workingDays: { type: Number },
    presentDays: { type: Number },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound index: one payslip per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Auto-calculate totals
payrollSchema.pre("save", function () {
  this.totalAllowances =
    (this.allowances?.hra || 0) +
    (this.allowances?.transport || 0) +
    (this.allowances?.medical || 0) +
    (this.allowances?.other || 0);

  this.totalDeductions =
    (this.deductions?.tax || 0) +
    (this.deductions?.pf || 0) +
    (this.deductions?.leavePenalty || 0) +
    (this.deductions?.other || 0);

  this.grossSalary = this.basicSalary + this.totalAllowances + (this.bonus || 0);
  this.netSalary = this.grossSalary - this.totalDeductions;
});

const Payroll = mongoose.model("Payroll", payrollSchema);
export default Payroll;
