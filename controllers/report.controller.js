import Post from "./../models/Post.js";
import User from "./../models/User.js";
import Report from "./../models/Report.js";
import Event from "../models/Event.js";

export const createReport = async (req, res) => {
  const { itemId, userId, type, reason, detail } = req.body;
  try {
    if (type === "event") {
      const event = await Event.findOne({ _id: itemId });
      if (!event) {
        return res.status(404).json({ message: "Event not found", code: 1 });
      }
    }
    if (type === "post") {
      const post = await Post.findOne({ _id: itemId });
      if (!post) {
        return res.status(404).json({ message: "Post not found", code: 1 });
      }
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found", code: 2 });
    }
    const newReport = new Report({
      itemId: itemId,
      userId: userId,
      type: type,
      reason: reason,
    });
    if (detail) {
      newReport.detail = detail;
    }
    await newReport.save();
    return res.status(200).json({ message: "Success report", code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
