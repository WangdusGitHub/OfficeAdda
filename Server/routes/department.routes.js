import express from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} from "../controllers/department.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllDepartments);
router.get("/stats", protect, authorize("admin", "manager"), getDepartmentStats);
router.post("/", protect, authorize("admin"), createDepartment);
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

export default router;
