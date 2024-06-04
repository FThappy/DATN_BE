import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";

import { multerError } from "../utils/multerError.js";
import { createEvent, createJoinEvent, deleteEventById, deleteJoinEvent, deleteJoinEventByOwner, eventSearch, eventSearchOwner, getCountUserJoinEvent, getEvent, getEventById, getEventOwner, getEventUserJoin, getJoinById, getTotalPageEvent, getTotalPageEventOwner, getTotalPageEventUserJoin, getUserJoinEvent,  updateEvent } from "../controllers/event.controller.js";

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
  createEvent
);
router.put(
  "/",
  upload_image.array("file"),
  multerError,
  verifyToken,
  updateEvent
);
router.get("/owner" ,verifyToken , getEventOwner)
router.get("/owner/total-page",verifyToken , getTotalPageEventOwner)
router.post("/owner/search",verifyToken , eventSearchOwner)
router.get("/user-event",verifyToken , getEventUserJoin)
router.get("/user-event/total-page", verifyToken , getTotalPageEventUserJoin)

router.post("/search",eventSearch)
router.post("/join", verifyToken, createJoinEvent);
router.delete("/join", verifyToken, deleteJoinEvent);
router.delete("/join-owner", verifyToken, deleteJoinEventByOwner);
router.delete("", verifyToken, deleteEventById);
router.get("/total-join", getCountUserJoinEvent);
router.get("/list-users", getUserJoinEvent);
router.get("/join", verifyToken, getJoinById);
router.get("/total", getTotalPageEvent);
router.get("/:eventId", getEventById)
router.get("", getEvent);



export default router;
