import express from "express";
import { register,login, logout, sendOTPRegister, forgotPassword, browserOTP, rePassword, getOTPCertainUser, certainUser, sendOTPtoNewEmail, getAuthUser } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.delete("/logout", verifyToken ,logout);

router.post("/otp", sendOTPRegister);

router.post("/forgotPassword", forgotPassword)

router.post("/browser-otp",browserOTP)

router.post("/re-password", rePassword)

router.post("/otp-certain", verifyToken ,getOTPCertainUser);

router.post("/certain", verifyToken, certainUser);

router.post("/new-mail", verifyToken, sendOTPtoNewEmail);

router.get("/info", verifyToken, getAuthUser);






export default router;