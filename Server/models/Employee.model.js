import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    designation: { type: String },
    role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    profilePicture: { type: String, default: "" },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

// Auto-generate employeeId
employeeSchema.pre("save", async function () {
  if (!this.employeeId) {
    const count = await mongoose.model("Employee").countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
  }
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
