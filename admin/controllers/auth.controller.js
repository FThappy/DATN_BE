import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import bcrypt from "bcrypt";
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ msg: "Nguời dùng không tồn tại", code: 1 });
    }
    if (!user.isAdmin) {
      return res.status(401).json({
        msg: "Tài Khoản không phải admin",
        code: 5,
      });
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
      .cookie("AuthorizationAdmin", accessToken, {
        httpOnly: true,
        maxAge: age,
        secure: true, // https
        sameSite: "None",
      })
      .status(200)
      .json({
        msg: "Đăng nhập thành công",
        code: 0,
        user: {
          id: user._id,
          username: user.username,
          img: user.img,
          displayName: user.displayname,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: "Faile to login", code: 3 });
  }
};
