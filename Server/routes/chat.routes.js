import express from "express";
import { getChatHistory, getChannels, createChannel, deleteChannel } from "../controllers/chat.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/channels", protect, getChannels);
router.post("/channels", protect, authorize("admin", "manager"), createChannel);
router.delete("/channels/:id", protect, authorize("admin", "manager"), deleteChannel);
router.get("/:channel", protect, getChatHistory);

export default router;
