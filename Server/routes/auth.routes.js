import express from "express";
import { register, login, getMe, changePassword, resetFirstPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { loginSchema, validate } from "../middleware/validator.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/reset-first-password", protect, resetFirstPassword);

export default router;
