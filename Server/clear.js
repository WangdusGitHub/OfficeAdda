import dotenv from "dotenv";
import mongoose from "mongoose";
import Payroll from "./models/Payroll.model.js";

dotenv.config();

const clear = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Payroll.deleteMany({});
  console.log("Cleared payrolls!");
  process.exit();
}
clear();
