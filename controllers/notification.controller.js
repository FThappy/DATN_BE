import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { authenticateToken } from "./comment.controller.js";

const NUMBER_NOTIFICATION = 8;

export const joinRoomNotification = (io, socket) => {
  socket.on("join-private-notification", async () => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        if (!owner) {
          socket.emit("error-notification", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(socket.user.id)) {
          socket.join(socket.user.id);
        }
      } catch (error) {
        console.log(error);
        socket.emit("error-notification", { message: "Server error", code: 4 });
      }
    });
  });
};

export const getListNotificationById = async (req, res) => {
  const page = req.query.page;
  const skipItem = Number(req.query.skipItem) || 0;
  try {
    const skipNotification = page * NUMBER_NOTIFICATION + skipItem;
    console.log(skipNotification);

    const listNotification = await Notification.find({
      to: req.userId.id,
    })
      .sort({ _id: -1 })
      .skip(skipNotification)
      .limit(8);
    return res
      .status(200)
      .json({ message: "Success", data: listNotification, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const getTotalNotificationUnReadById = async (req, res) => {
  try {
    const total = await Notification.countDocuments({
      to: req.userId.id,
      isRead: false,
    });
    return res.status(200).json({ message: "Success", data: total, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const removeNotification = (io, socket) => {
  socket.on("remove-notification", async (userId, type) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        if (!owner) {
          socket.emit("error-notification", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const user = await User.findOne({ _id: userId });
        if (!user) {
          socket.emit("error-notification", {
            message: "Không đủ thẩm quyền",
            code: 4,
          });
          return;
        }
        const notification = await Notification.findOne({
          from: socket.user.id,
          to: userId,
          type: type,
        });
        const notificationReceiver = await Notification.findOne({
          from: userId,
          to: socket.user.id,
          type: type,
        });
        if (notification) {
          await Notification.findOneAndDelete({
            from: socket.user.id,
            to: userId,
            type: type,
          });
          io.to(userId).emit("remove-notification", notification._id);
          return;
        }
        if (notificationReceiver) {
          await Notification.findOneAndDelete({
            from: userId,
            to: socket.user.id,
            type: type,
          });
          io.to(socket.user.id).emit(
            "remove-notification",
            notificationReceiver._id
          );
          return;
        }
      } catch (error) {
        console.log(error);
        socket.emit("error-notification", { message: "Server error", code: 4 });
      }
    });
  });
};

export const changeIsRead = async (req, res) => {
  const notificationId = req.body.notificationId;
  try {
    const owner = await User.findOne({ _id: req.userId.id });
    if (!owner) {
      return res.status(404).json({ message: " User not exist", code: 3 });
    }
    const notification = await Notification.findOne({
      _id: notificationId,
      to: req.userId.id,
    });
    if (!notification) {
      return res
        .status(404)
        .json({ message: "Notification not exist", code: 1 });
    }
    notification.isRead = true;
    await notification.save();
    return res
      .status(200)
      .json({ message: "Success", data: notification, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
