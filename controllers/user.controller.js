import OTP from "../models/OTP.js";
import User from "../models/User.js";
import {
  deleteFile,
  deleteFolder,
  uploadFile,
  uploadProfileImage,
} from "../utils/file.js";
import { checkValidGmail } from "../utils/utilsEmail.js";
import { checkValidPhoneNumber } from "../utils/utilsPhone.js";
import CryptoJS from "crypto-js";
import bcrypt from "bcrypt";
export const getUserById = async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await User.findOne({ _id: userId }).select({
      _id: 1,
      username: 1,
      img: 1,
      displayname: 1,
    });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    console.log;
    return res.status(200).json({ message: "Success", code: 0, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const changeWall = async (req, res) => {
  const userId = req.params.userId;
  const file = req.file;
  try {
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    await deleteFolder(`profile/${userId}/wall/`);
    const urlWall = await uploadProfileImage(
      file,
      `profile/${userId}/wall/${file.originalname}`
    );
    user.wall = urlWall;
    await user.save();
    return res
      .status(200)
      .json({ message: "Success", code: 0, data: user.wall });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};
export const changeImage = async (req, res) => {
  const userId = req.params.userId;
  const file = req.file;
  try {
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    await deleteFolder(`profile/${userId}/image/`);
    const urlImage = await uploadProfileImage(
      file,
      `profile/${userId}/image/${file.originalname}`
    );
    user.img = urlImage;
    await user.save();
    return res
      .status(200)
      .json({ message: "Success", code: 0, data: user.img });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};
export const getUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    return res.status(200).json({ message: "Success", code: 0, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.userId.id;
  const displayName = req.body.displayName;
  const phone = req.body.phone;
  const birth = req.body.birth;
  const type = req.body.type;
  const address = req.body.address;
  try {
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (phone) {
      if (!checkValidPhoneNumber(phone)) {
        return res.status(400).json({ message: "Phone not valid", code: 5 });
      } else {
        user.phone = phone;
      }
    }
    if (displayName) {
      user.displayname = displayName;
    }
    if (birth) {
      user.birth = birth;
    }
    if (type) {
      user.type = type;
    }
    if (address) {
      user.address = address;
    }
    await user.save();
    return res.status(200).json({ message: "Success", code: 0, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const updateUsername = async (req, res) => {
  const userId = req.userId.id;
  const username = req.body.username;
  try {
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 1 });
    }
    const isUserName = await User.findOne({ username: username });
    if (isUserName) {
      return res.status(400).json({ message: "User exist", code: 6 });
    }
    user.username = username;
    await user.save();
    return res.status(200).json({ message: "Success", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const updateMail = async (req, res) => {
  const userId = req.userId.id;
  const email = req.body.email;
  const otp = req.body.otp;
  const type = req.body.type;
  try {
    if (!checkValidGmail(email)) {
      return res.status(400).json({ message: "Email not valid", code: 2 });
    }
    const isEmail = await User.findOne({ email: email });
    if (isEmail) {
      return res.status(400).json({ message: "Email exist", code: 6 });
    }
    const isOTP = await OTP.findOne({ email: email, otp: otp, type: type });
    if (!isOTP) {
      return res.status(404).json({ msg: "Not found otp", code: 3 });
    }
    try {
      await OTP.findOneAndDelete({ email: email, otp: otp, type: type });
    } catch (error) {
      return res.status(500).json({ message: "Server error", code: 4 });
    }
    const user = await User.findOne({ _id: userId }).select({ password: 0 });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 1 });
    }
    if (!checkValidGmail(email)) {
      return res.status(403).json({ message: "Bad Email", code: 2 });
    } else {
      user.email = email;
      await user.save();
      return res.status(200).json({ message: "Success", code: 0 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const updateChangePassword = async (req, res) => {
  const userId = req.userId.id;
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 1 });
    }
    const hashedOldPassword = CryptoJS.AES.decrypt(
      oldPassword,
      process.env.PASS_SEC
    );
    const originalOldPassword = hashedOldPassword.toString(CryptoJS.enc.Utf8);
    const checkPassword = await bcrypt.compare(
      originalOldPassword,
      user.password
    );
    if (!checkPassword) {
      return res
        .status(401)
        .json({ msg: "Nhập sai mật khẩu hiện tại", code: 5 });
    }
    const hashedNewPassword = CryptoJS.AES.decrypt(
      newPassword,
      process.env.PASS_SEC
    );
    const originalPassword = hashedNewPassword.toString(CryptoJS.enc.Utf8);
    let new_password;
    try {
      new_password = await bcrypt.hash(originalPassword, 10);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server Error", code: 4 });
    }
    user.password = new_password;
    await user.save();
    return res.status(200).json({ message: "Success", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const searchUser = async (req, res) => {
  const qSearch = req.query.qSearch;
  const page = req.query.page;
  const skip = page * 10;
  try {
    const listFind = await User.find({
      $or: [
        { username: { $regex: qSearch, $options: "i" } },
        { displayname: { $regex: qSearch, $options: "i" } },
      ],
    })
      .select({
        _id: 1,
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(10);
    return res
      .status(200)
      .json({ message: "Success", data: listFind, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};
