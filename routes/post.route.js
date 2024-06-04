import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createPost,
  deletePost,
  getPost,
  getPostByEvent,
  getPostByUser,
  getPostPublic,
  updatePost,
} from "../controllers/post.controller.js";
import { multerError } from "../utils/multerError.js";

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
  createPost
);
router.put(
  "/",
  upload_image.array("file"),
  multerError,
  verifyToken,
  updatePost
);
router.get("", verifyToken, getPost);
router.get("/event",  getPostByEvent);
router.get("/public", getPostPublic);
router.get("/:userId", verifyToken, getPostByUser);
router.delete("/", verifyToken, deletePost);

export default router;
