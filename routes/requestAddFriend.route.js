import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkReqAddFriend, refuseRequestAddFriend, rejectaAddFriend } from "../controllers/requestAddFriend.controller.js";

const router = express.Router();

router.get("/check", verifyToken, checkReqAddFriend);
router.delete("/reject", verifyToken, rejectaAddFriend);
router.delete("/refuse", verifyToken, refuseRequestAddFriend);


export default router;
