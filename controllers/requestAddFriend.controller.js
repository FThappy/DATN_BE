import Friend from "../models/Friend.js";
import Notification from "../models/Notification.js";
import RequestAddFriend from "../models/RequestAddFriend.js";
import User from "../models/User.js";
import { authenticateToken } from "./comment.controller.js";

export const createReqAddFriend = (io, socket) => {
  socket.on("send-req-add-friend", async (userId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        if (!owner) {
          socket.emit("error-req", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const user = await User.findOne({ _id: userId });
        if (!user) {
          socket.emit("error-req", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const reqAddFriend = await RequestAddFriend.findOne({
          from: socket.user.id,
          to: userId,
        });
        const reqAddFriend2 = await RequestAddFriend.findOne({
          from: userId,
          to: socket.user.id,
        });
        await Promise.all([reqAddFriend, reqAddFriend2]);
        if (reqAddFriend || reqAddFriend2) {
          console.log("a");
          socket.emit("error-req", {
            message: "Đã tồn tại yêu cầu này rồi",
            code: 4,
          });
          return;
        }
        const newAddFriend = new RequestAddFriend({
          from: socket.user.id,
          to: userId,
        });
        await newAddFriend.save();
        socket.emit("send-req-add-friend", newAddFriend);
        const notification = await Notification.findOne({
          from: socket.user.id,
          to: userId,
          type: "addFriend",
        });
        if (!notification) {
          const newNotification = new Notification({
            from: socket.user.id,
            to: userId,
            content: newAddFriend._id.toString(),
            type: "addFriend",
          });
          await newNotification.save();
          io.to(userId).emit("notification-req-friend", newNotification);
        }
      } catch (error) {
        console.log(error);
        socket.emit("error-req", { message: "Server error", code: 4 });
      }
    });
  });
};

export const checkReqAddFriend = async (req, res) => {
  const userId = req.query.userId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    const user = await User.findOne({ _id: userId });
    await Promise.all([owner, user]);
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const reqAddFriend = await RequestAddFriend.findOne({
      from: req.userId.id,
      to: userId,
    });
    const reqAddFriend2 = await RequestAddFriend.findOne({
      from: userId,
      to: req.userId.id,
    });
    await Promise.all([reqAddFriend, reqAddFriend2]);
    if (!reqAddFriend && !reqAddFriend2) {
      return res.status(404).json({ message: " Request not exist", code: 1 });
    }
    return res.status(200).json({
      message: "Success ",
      code: 0,
      reqAddFriend: reqAddFriend ? reqAddFriend : reqAddFriend2,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const rejectaAddFriend = async (req, res) => {
  const userId = req.query.userId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    const user = await User.findOne({ _id: userId });
    await Promise.all([owner, user]);
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const reqAddFriend = await RequestAddFriend.findOne({
      from: req.userId.id,
      to: userId,
    });
    if (!reqAddFriend) {
      return res.status(404).json({ message: " Request not exist", code: 1 });
    }
    await RequestAddFriend.findOneAndDelete({
      from: req.userId.id,
      to: userId,
    });
    return res.status(200).json({
      message: "Success reject ",
      code: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const acceptRequestAddFriend = async (io, socket) => {
  socket.on("accept-req-friend", async (userId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        const user = await User.findOne({ _id: userId });
        await Promise.all([owner, user]);
        if (!owner) {
          socket.emit("error-req", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        if (!user) {
          socket.emit("error-req", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const reqAddFriend = await RequestAddFriend.findOne({
          from: userId,
          to: socket.user.id,
        });
        if (!reqAddFriend) {
          socket.emit("error-req", {
            message: "Không tồn tại lời mời này",
            code: 4,
          });
          socket.emit("error-notification", {
            message: "Không tồn tại lời mời này",
            code: 4,
          });
          return;
        }
        const newFriend = new Friend({
          friend: [socket.user.id, userId],
        });
        await newFriend.save();
        await RequestAddFriend.findOneAndDelete({
          from: userId,
          to: socket.user.id,
        });
        socket.emit("accept-req-friend", newFriend);
        const notification = await Notification.findOne({
          from: userId,
          to: socket.user.id,
          type: "addFriend",
        });
        const notificationByOwner = await Notification.findOne({
          from: socket.user.id,
          to: userId,
          type: "addFriend",
        });
        await Promise.all([notification, notificationByOwner]);
        if (notification) {
          console.log("send");
          socket.emit("remove-notification", notification._id);
          await Notification.findOneAndDelete({
            from: userId,
            to: socket.user.id,
            type: "addFriend",
          });
        }
        if (!notificationByOwner) {
          const newNotification = new Notification({
            from: socket.user.id,
            to: userId,
            content: "AccepFrient",
            type: "acceptFriend",
          });
          await newNotification.save();
          io.to(userId).emit("notification-req-friend", newNotification);
        }
      } catch (error) {
        console.log(error);
        socket.emit("error-req", { message: "Server error", code: 4 });
      }
    });
  });
};
export const refuseRequestAddFriend = async (req, res) => {
  const userId = req.query.userId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    const user = await User.findOne({ _id: userId });
    await Promise.all([owner, user]);
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    if (!user) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const reqAddFriend = await RequestAddFriend.findOne({
      from: userId,
      to: req.userId.id,
    });
    if (!reqAddFriend) {
      return res.status(404).json({ message: " Request not exist", code: 1 });
    }
    await RequestAddFriend.findOneAndDelete({
      from: userId,
      to: req.userId.id,
    });
    return res.status(200).json({
      message: "Success ",
      code: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
