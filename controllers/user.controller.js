import User from "../models/User.js";
import { deleteFile, deleteFolder, uploadFile, uploadProfileImage } from "../utils/file.js";

export const getUserById = async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await User.findOne({ _id: userId }).select({
      _id: 1,
      username: 1,
      img: 1,
    });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    console.log
    return res.status(200).json({ message: "Success", code: 0, data : user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};

export const changeWall = async (req,res)=>{
    const userId = req.params.userId;
    const file  = req.file;
    try {
      const user = await User.findOne({ _id: userId }).select({password: 0})
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
      return res.status(200).json({ message: "Success", code: 0, data: user.wall });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server Error", code: 4 });
    }
}
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
    const user = await User.findOne({ _id: userId }).select({password: 0});;
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    return res.status(200).json({ message: "Success", code: 0, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", code: 4 });
  }
};
