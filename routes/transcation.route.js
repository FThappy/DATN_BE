import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { callbackZalopay, getTranscation, getTranscationByProjectId, getTranscationByUserId, transcationSearch, zalopay } from "../controllers/transcation.controller.js";


const router = express.Router();


router.post("/zalopay", verifyToken, zalopay);
router.post("/callback-zalopay", callbackZalopay)
router.get("", getTranscation);
router.get("/user", verifyToken, getTranscationByUserId)
router.get("/project", getTranscationByProjectId);
router.get("/search", verifyToken, transcationSearch);



export default router;
