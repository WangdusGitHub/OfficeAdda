import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
} from "../controllers/attendance.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkin", protect, checkIn);
router.put("/checkout", protect, checkOut);
router.get("/my", protect, getMyAttendance);
router.get("/", protect, authorize("admin", "manager"), getAllAttendance);
router.post("/mark", protect, authorize("admin", "manager"), markAttendance);

export default router;
