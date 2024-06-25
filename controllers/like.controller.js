import Like from "../models/Like.js";
import User from "../models/User.js";
import Event from "./../models/Event.js";
import Post from "./../models/Post.js";
import Project from "./../models/Project.js";

export const likeItem = async (req, res) => {
  const type = req.body.type;
  const itemId = req.body.itemId;
  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    let item;
    if (type === "post") {
      item = await Post.findOne({
        _id: itemId,
      });
    }
    if (type === "event") {
      item = await Event.findOne({
        _id: itemId,
      });
    }
    if (type === "project") {
      item = await Project.findOne({
        _id: itemId,
      });
    }
    if (type === "user") {
      item = await User.findOne({ _id: itemId });
    }
    if (!item) {
      return res.status(404).json({ msg: "Not found post", code: 1 });
    }
    const newLike = new Like({
      itemId: itemId,
      userId: req.userId.id,
    });
    await newLike.save();
    return res.status(200).json({ message: "Success", code: 0, like: newLike });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const unLike = async (req, res) => {
  const itemId = req.query.itemId;
  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const like = await Like.findOne({ itemId: itemId, userId: req.userId.id });
    if (!like) {
      return res.status(404).json({ msg: "Not found post", code: 1 });
    }
    await Like.findOneAndDelete({ itemId: itemId, userId: req.userId.id });
    return res.status(200).json({ message: "Success ", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const totalLikeById = async (req, res) => {
  const itemId = req.query.itemId;
  try {
    const like = await Like.findOne({ itemId: itemId});
    if (!like) {
      return res.status(404).json({ msg: "Not found post", code: 1 });
    }    
    const totalLike = await Like.countDocuments({ itemId: itemId})
    return res.status(200).json({ message: "Success ", code: 0 , total : totalLike });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const checkLike = async (req, res) => {
  const itemId = req.query.itemId;
  try {
    const user = await User.findOne({ _id: req.userId.id });
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const like = await Like.findOne({ itemId: itemId, userId: req.userId.id });
    if (!like) {
      return res.status(404).json({ msg: "Not found post", code: 1 });
    }
    return res.status(200).json({ message: "Success ", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};