import express from "express";

import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";

import { multerError } from "../utils/multerError.js";
import { createProject, getProjectById, updateProject } from "../controllers/project.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const upload_image = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      req.multerError = true;
      cb(null, false, req.multerError);
    }
  },
});
router.post(
  "/",
  upload_image.array("file"),
  multerError,
  verifyToken,
  createProject
);
router.put(
  "/",
  upload_image.array("file"),
  multerError,
  verifyToken,
  updateProject
);
router.get("/:projectId", getProjectById);

export default router;
