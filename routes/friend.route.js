import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkFriend, deleteFriend, getListFriendById, getNoFriend, getTotalFriend, getUserReceived, getUserSendReq } from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/check", verifyToken, checkFriend);

router.get("/total", verifyToken, getTotalFriend);

router.get("/id",verifyToken , getListFriendById)

router.delete("/id", verifyToken, deleteFriend);

router.get("/new", verifyToken, getNoFriend);

router.get("/share", verifyToken, getUserSendReq);

router.get("/receive", verifyToken, getUserReceived);

export default router;
