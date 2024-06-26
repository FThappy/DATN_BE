import express from "express";

import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";

import { multerError } from "../utils/multerError.js";
import { createProject, deleteProjectById, getProject, getProjectById, getProjectByUserId, projectSearch, projectSearchByOwner, updateProject } from "../controllers/project.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
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
  upload_image.fields([
    { name: "file"}, // Tên trường 'file' có thể gửi nhiều tệp tin, nhưng chỉ cho phép tối đa 1 tệp tin
    { name: "fileContent"}, // Tên trường 'fileContent' cũng chỉ cho phép tối đa 1 tệp tin
  ]),
  multerError,
  verifyToken,
  createProject
);
router.put(
  "/",
  upload_image.fields([
    { name: "file" }, // Tên trường 'file' có thể gửi nhiều tệp tin, nhưng chỉ cho phép tối đa 1 tệp tin
    { name: "fileContent" }, // Tên trường 'fileContent' cũng chỉ cho phép tối đa 1 tệp tin
  ]),
  multerError,
  verifyToken,
  updateProject
);
router.delete("", verifyToken, deleteProjectById);
router.get("", getProject);
router.get("/owner",verifyToken ,getProjectByUserId);
router.post("/search", projectSearch);
router.post("/search/owner",verifyToken ,projectSearchByOwner);

router.get("/:projectId", getProjectById);

export default router;
