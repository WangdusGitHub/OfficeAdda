import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadProfilePicture,
  uploadDocument,
} from "../controllers/employee.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate, employeeSchema } from "../middleware/validator.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getAllEmployees);
router.get("/:id", protect, getEmployeeById);
router.post("/", protect, authorize("admin"), validate(employeeSchema), createEmployee);
router.put("/:id", protect, authorize("admin", "manager"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);
router.post("/:id/profile-picture", protect, upload.single("profilePicture"), uploadProfilePicture);
router.post("/:id/documents", protect, upload.single("document"), uploadDocument);

export default router;
