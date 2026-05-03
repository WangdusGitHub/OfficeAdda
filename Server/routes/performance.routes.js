import express from "express";
import {
  addReview,
  getEmployeePerformance,
  getMyPerformance,
  getAllPerformance,
  updateReview,
} from "../controllers/performance.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getAllPerformance);
router.post("/", protect, authorize("admin", "manager"), addReview);
router.get("/my", protect, getMyPerformance);
router.get("/:employeeId", protect, authorize("admin", "manager"), getEmployeePerformance);
router.put("/:id", protect, authorize("admin", "manager"), updateReview);

export default router;
