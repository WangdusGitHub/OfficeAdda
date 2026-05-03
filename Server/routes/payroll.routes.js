import express from "express";
import {
  generatePayroll,
  getMyPayroll,
  getAllPayroll,
  markAsPaid,
} from "../controllers/payroll.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, authorize("admin"), generatePayroll);
router.get("/my", protect, getMyPayroll);
router.get("/", protect, authorize("admin"), getAllPayroll);
router.put("/:id/pay", protect, authorize("admin"), markAsPaid);

export default router;
