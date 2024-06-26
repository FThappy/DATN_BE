import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import {
  changeIsRead,
  getListNotificationById,
  getProjectByIdNotification,
  getTotalNotificationUnReadById,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("", verifyToken);
router.get("/id", verifyToken, getListNotificationById);
router.get("/total", verifyToken, getTotalNotificationUnReadById);
router.put("/isRead", verifyToken, changeIsRead);
router.put("/trans", verifyToken, getProjectByIdNotification);


export default router;
