import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendMail.js";
import OTP from "../models/OTP.js";
import { checkValidGmail } from "../utils/utilsEmail.js";
import { checkValidPhoneNumber } from "./../utils/utilsPhone.js";
import CryptoJS from "crypto-js";
import bcrypt from "bcrypt";


export const register = async (req, res) => {
  try {
    const { inforRegister, otp } = req.body;
    if (
      !inforRegister.username ||
      !inforRegister.email ||
      !inforRegister.password ||
      !inforRegister.phone ||
      !inforRegister.address ||
      !inforRegister.type ||
      !inforRegister.birth
    ) {
      return res.status(400).json({ message: "lack of information", code: 7 });
    }
    const isUser = await User.findOne({ username: inforRegister.username });
    if (isUser) {
      return res.status(400).json({ message: "User exist", code: 3 });
    }
    if (!checkValidGmail(inforRegister.email)) {
      return res.status(400).json({ message: "Email not valid", code: 2 });
    }
    const isEmail = await User.findOne({ email: inforRegister.email });
    if (isEmail) {
      return res.status(400).json({ message: "Email exist", code: 6 });
    }

    if (!checkValidPhoneNumber(inforRegister.phone)) {
      return res.status(400).json({ message: "Phone not valid", code: 5 });
    }
    const isOTP = await OTP.findOne({ email: inforRegister.email, otp: otp }); 
    
    if (!isOTP) {
      return res.status(404).json({ msg: "Not found otp", code: 1 });
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      inforRegister.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    let _password;
    try {
      _password = await bcrypt.hash(originalPassword, 10);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server Error", code: 4 });
    }
    const newUser = new User({
      username: inforRegister.username,
      email: inforRegister.email,
      password: _password,
      phone: inforRegister.phone,
      address: inforRegister.address,
      type: inforRegister.type,
      birth: inforRegister.birth,
    });
    await newUser.save();
    await OTP.findOneAndDelete({ email: inforRegister.email, otp: otp });
    return res.status(200).json({ message: "Success register", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ msg: "Nguời dùng không tồn tại", code: 1 });
    }

    if (user.isLock) {
      return res.status(401).json({
        msg: "Tài Khoản đã bị khóa",
        code: 4,
      });
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      req.body.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    const checkPassword = await bcrypt.compare(originalPassword, user.password);
    if (!checkPassword) {
      return res
        .status(401)
        .json({ msg: "Sai mật khẩu hoặc tài khoản", code: 2 });
    }

    const age = 1000 * 60 * 60 * 24 * 7;
    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      { expiresIn: age }
    );

    console.log(user.img);

    return res
      .cookie("Authorization", accessToken, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json({
        msg: "Đăng nhập thành công",
        code: 0,
        user: {
          id: user._id,
          username: user.username,
          img: user.img,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: "Faile to login", code: 3 });
  }
};

export const logout = (req, res) => {
  try {
    if(!req.cookies.Authorization){
      return res.status(500).json({ message: "Not Authenticated!", code: 4 });
    }
    res.clearCookie("Authorization");
    return res.status(200).json({ message: "Logout Access", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const sendOTPRegister = async (req, res) => {
  try {
    const dataSend = req.body;
    if (!checkValidGmail(dataSend.email)) {
      return res.status(400).json({ message: "Email not valid", code: 2 });
    }
    const isEmail = await User.findOne({ email: dataSend.email });
    if (isEmail) {
      return res.status(400).json({ message: "Email exist", code: 6 });
    }
    try {
      await OTP.findOneAndDelete({ email: dataSend.email });
    } catch (error) {
      return res.status(500).json({ message: "Server error", code: 4 });
    }
    try {
      const _OTP = await sendMail("Mã sác thực đăng ký", dataSend.email);
      const newOTP = new OTP({
        otp: _OTP,
        email: dataSend.email,
      });
      await newOTP.save();
    } catch (error) {
      return res.status(500).json({ message: "Send OTP Error", code: 3 });
    }
    return res.status(200).json({ message: "Access send OTP", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const forgotPassword = async (req, res) => {
  const email = req.body.email;
  try {
    if (!checkValidGmail(email)) {
      return res.status(400).json({ message: "Email not valid", code: 2 });
    }
    const isEmail = await User.findOne({ email: email });
    if (!isEmail) {
      return res.status(400).json({ message: "Email not exist", code: 1 });
    }
    try {
      await OTP.findOneAndDelete({ email: email });
    } catch (error) {
      return res.status(500).json({ message: "Server error", code: 4 });
    }
    try {
      const _OTP = await sendMail("Mã xác thực lấy lại mật khẩu", email);
      const newOTP = new OTP({
        otp: _OTP,
        email: email,
      });
      await newOTP.save();
    } catch (error) {
      return res.status(500).json({ message: "Send OTP Error", code: 3 });
    }
    return res.status(200).json({ message: "Access send OTP", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const browserOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!checkValidGmail(email)) {
      return res.status(400).json({ message: "Email not valid", code: 1 });
    }
    const isEmail = await User.findOne({ email: email });
    if (!isEmail) {
      return res.status(404).json({ message: "Email not exist", code: 2 });
    }
    const isOTP = await OTP.findOne({ email: email, otp: otp });
    if (!isOTP) {
      return res.status(404).json({ msg: "Not found otp", code: 3 });
    }
    try {
      await OTP.findOneAndDelete({ email: email, otp: otp });
    } catch (error) {
      return res.status(500).json({ message: "Server error", code: 4 });
    }
    const tokenRePassword = jwt.sign(
      {
        email: email,
      },
      process.env.RE_PASSWORD_JWT_SEC,
      { expiresIn: 1000 * 60 * 60 }
    );

    return res.status(200).json({
      message: "Access browser",
      code: 0,
      tokenRePassword: tokenRePassword,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const rePassword = async (req, res) => {
  try {
    const password = req.body.password;
    const authHeader = req.headers.tokenrepassword;
    let emailJWT;
    if (authHeader) {
      jwt.verify(authHeader, process.env.RE_PASSWORD_JWT_SEC, (err, email) => {
        console.log(err);
        if (err) {
          return res.status(403).json({ msg: "Token is not valid", code: 3 });
        }
        emailJWT = email;
      });
    } else {
      return res.status(401).json({ msg: "Token is not valid", code: 1 });
    }
    if (emailJWT.email !== req.headers.email) {
      return res.status(401).json({ msg: "Token is not valid", code: 1 });
    }
    if (!checkValidGmail(req.headers.email)) {
      return res.status(400).json({ message: "Email not valid", code: 2 });
    }
    const isEmail = await User.findOne({ email: req.headers.email });
    if (!isEmail) {
      return res.status(404).json({ message: "Email  not valid", code: 2 });
    }
    const hashedPassword = CryptoJS.AES.decrypt(password, process.env.PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    try {
      const _password = await bcrypt.hash(originalPassword, 10);
      await User.findOneAndUpdate(
        { email: req.headers.email },
        {
          $set: {
            password: _password,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server Error", code: 4 });
    }

    return res.status(200).json({ message: "Access ", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
