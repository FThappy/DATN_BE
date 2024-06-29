import express from "express";
import multer from "multer";

import { verifyToken } from "../middleware/verifyToken.js";
import { checkRoom, getMessageForRoom, getMessageRoomForUserId, getMessageRoomForUserIdSearch, sendMess, sendMessFirst } from "../controllers/messenger.controller.js";
import { multerError } from "../utils/multerError.js";

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
  upload_image.array("file"),
  multerError,
  verifyToken,
  sendMess
);
router.post(
  "/first",
  upload_image.array("file"),
  multerError,
  verifyToken,
  sendMessFirst
);

router.get("/check", verifyToken, checkRoom);

router.get("/room", verifyToken, getMessageForRoom);

router.get("/user", verifyToken, getMessageRoomForUserId);

router.get("/search", verifyToken, getMessageRoomForUserIdSearch);






export default router;
