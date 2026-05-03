import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from "../controllers/leave.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate, leaveSchema } from "../middleware/validator.middleware.js";

const router = express.Router();

router.post("/", protect, validate(leaveSchema), applyLeave);
router.get("/my", protect, getMyLeaves);
router.get("/", protect, authorize("admin", "manager"), getAllLeaves);
router.put("/:id/status", protect, authorize("admin", "manager"), updateLeaveStatus);

export default router;
