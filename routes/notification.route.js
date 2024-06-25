import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import {
  changeIsRead,
  getListNotificationById,
  getTotalNotificationUnReadById,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("", verifyToken);
router.get("/id", verifyToken, getListNotificationById);
router.get("/total", verifyToken, getTotalNotificationUnReadById);
router.put("/isRead", verifyToken, changeIsRead);

export default router;
