import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { createReport } from './../controllers/report.controller.js';

const router = express.Router();


router.post("", verifyToken ,createReport);

export default router;
