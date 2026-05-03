import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true }, // e.g. "Q1-2024"
    ratings: {
      productivity: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      leadership: { type: Number, min: 1, max: 5 },
    },
    overallRating: { type: Number },
    feedback: { type: String },
    goals: [{ type: String }],
    achievements: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-calculate overall rating
performanceSchema.pre("save", function () {
  if (this.ratings) {
    const r = this.ratings;
    const values = [r.productivity, r.teamwork, r.communication, r.punctuality, r.leadership].filter(Boolean);
    if (values.length) {
      this.overallRating = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
    }
  }
});

const Performance = mongoose.model("Performance", performanceSchema);
export default Performance;
