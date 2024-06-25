import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkLike, likeItem, totalLikeById, unLike } from "../controllers/like.controller.js";

const router = express.Router();

router.post("", verifyToken, likeItem);

router.delete("", verifyToken , unLike);

router.get("/total", totalLikeById);

router.get("/check", verifyToken, checkLike);






export default router;
