import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { callbackZalopay, getTranscation, getTranscationByProjectId, getTranscationByUserId, zalopay } from "../controllers/transcation.controller.js";


const router = express.Router();


router.post("/zalopay", verifyToken, zalopay);
router.post("/callback-zalopay", callbackZalopay)
router.get("", getTranscation);
router.get("/user", verifyToken, getTranscationByUserId)
router.get("/project", verifyToken, getTranscationByProjectId);


export default router;
