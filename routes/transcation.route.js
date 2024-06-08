import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { callbackZalopay, zalopay } from "../controllers/transcation.controller.js";


const router = express.Router();


router.post("/zalopay", zalopay);
router.post("/callback-zalopay", callbackZalopay)

export default router;
