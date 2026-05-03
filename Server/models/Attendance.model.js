import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "half-day", "late", "on-leave"],
      default: "absent",
    },
    workingHours: { type: Number, default: 0 },
    location: {
      latitude: Number,
      longitude: Number,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index: one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Auto-calculate working hours
attendanceSchema.pre("save", async function () {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workingHours = parseFloat(diff.toFixed(2));
  }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
