import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkRoom, getMessageForRoom, getMessageRoomForUserId, getMessageRoomForUserIdSearch } from "../controllers/messenger.controller.js";

const router = express.Router();

router.get("/check", verifyToken, checkRoom);

router.get("/room", verifyToken, getMessageForRoom);

router.get("/user", verifyToken, getMessageRoomForUserId);

router.get("/search", verifyToken, getMessageRoomForUserIdSearch);






export default router;
