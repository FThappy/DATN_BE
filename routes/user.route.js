import express from "express";
import { changeImage, changeWall, getUser, getUserById } from "../controllers/user.controller.js";
import multer from "multer";
import { multerError } from "../utils/multerError.js";
import { verifyToken } from "../middleware/verifyToken.js";

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

router.get("", getUserById);

router.post("/wall/:userId",upload_image.single("file"),multerError, verifyToken ,changeWall)
router.post(
  "/image/:userId",
  upload_image.single("file"),
  multerError,
  verifyToken,
  changeImage
);

router.get("/:userId", upload_image.single("file"), getUser);


export default router;
