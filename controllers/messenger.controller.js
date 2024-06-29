import { io } from "../index.js";
import Message from "../models/Message.js";
import MessageRoom from "../models/MessageRoom.js";
import User from "../models/User.js";
import { deleteFile, uploadFile, uploadFileMessage } from "../utils/file.js";
import { authenticateToken } from "./comment.controller.js";

const NUMBER_MESSAGE = 15;

export const checkRoom = async (req, res) => {
  const userId = req.query.userId;
  try {
    const messageRoom = await MessageRoom.findOne({
      listUser: { $all: [userId, req.userId.id] },
      type: "single",
    });
    if (!messageRoom) {
      return res.status(404).json({ msg: "Not found ", code: 1 });
    }
    const listMessage = await Message.find({ to: messageRoom._id.toString() })
      .sort({ _id: -1 })
      .limit(15);
    return res.status(200).json({
      message: "Success ",
      code: 0,
      listMessage: listMessage,
      messageRoom: messageRoom,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const joinMessRoom = (io, socket) => {
  socket.on("join-messageRoom", async (roomId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        socket.join(roomId);
      } catch (error) {
        console.error(error);
        socket.emit("error-message", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const sendFirstMessage = (io, socket) => {
  socket.on("send-first-message", async (roomId, content) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id }).select({
          _id: 1,
          username: 1,
          img: 1,
          displayname: 1,
        });
        if (!owner) {
          return socket.emit("error-message", {
            msg: "User not found",
            code: 3,
          });
        }
        const user = await User.findOne({ _id: roomId }).select({
          _id: 1,
          username: 1,
          img: 1,
          displayname: 1,
        });
        if (!user) {
          return socket.emit("error-message", {
            msg: "User not found",
            code: 3,
          });
        }
        const newMessageRoom = new MessageRoom({
          listUser: [socket.user.id, roomId],
          type: "single",
        });
        await newMessageRoom.save();
        socket.join(newMessageRoom._id.toString());
        const newMessage = new Message({
          from: socket.user.id,
          to: newMessageRoom._id.toString(),
          content: content,
          isRead: [socket.user.id],
        });
        await newMessage.save();
        io.to(newMessageRoom._id.toString()).emit(
          "new-room",
          newMessageRoom,
          newMessage,
          roomId
        );
        io.to(roomId).emit("new-card", {
          room: newMessageRoom,
          lastMess: newMessage,
          user: owner,
        });
        socket.emit("new-card", {
          room: newMessageRoom,
          lastMess: newMessage,
          user: user,
        });
      } catch (error) {
        console.error(error);
        socket.emit("error-message", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const sendMessage = (io, socket) => {
  socket.on("send-message", async (roomId, content) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        await Promise.all([owner]);
        if (!owner) {
          return socket.emit("error-message", {
            msg: "User not found",
            code: 3,
          });
        }
        const room = await MessageRoom.findOne({ _id: roomId });
        if (!room) {
          return socket.emit("error-message", {
            msg: "Room not found",
            code: 3,
          });
        }
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomId)) {
          socket.join(roomId);
        }
        const newMessage = new Message({
          from: socket.user.id,
          to: roomId,
          content: content,
          isRead: [socket.user.id],
        });
        await newMessage.save();
        io.to(roomId).emit("send-message", newMessage, roomId);
        room.listUser.map((item) => {
          if (item !== socket.user.id) {
            io.to(item).emit("new-last", newMessage);
          }
        });
        socket.emit("new-last", newMessage);
      } catch (error) {
        console.error(error);
        socket.emit("error-message", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const getMessageForRoom = async (req, res) => {
  const roomId = req.query.roomId;
  const skipItem = Number(req.query.skipItem) || 0;

  try {
    const skipMESSAGE = skipItem;

    const messageRoom = await MessageRoom.findOne({
      _id: roomId,
      listUser: req.userId.id,
    });

    if (!messageRoom) {
      return res
        .status(404)
        .json({ message: "messageRoom not exist", code: 1 });
    }

    const listMESSAGE = await Message.find({ to: roomId })
      .sort({ _id: -1 })
      .skip(skipMESSAGE)
      .limit(15);
    return res
      .status(200)
      .json({ message: "Success", data: listMESSAGE, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
export const deleteMessage = (io, socket) => {
  socket.on("delete-message", async (roomId, messageId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: socket.user.id });
        await Promise.all([owner]);
        if (!owner) {
          return socket.emit("error-delete-message", {
            msg: "User not found",
            code: 3,
          });
        }
        const room = await MessageRoom.findOne({ _id: roomId });

        const message = await Message.findOne({
          _id: messageId,
          from: socket.user.id,
          to: roomId,
        });
        const lastMessage = await Message.findOne({ to: roomId }).sort({
          createdAt: -1,
        });
        await Promise.all([lastMessage, message, room]);
        if (!message) {
          return socket.emit("error-delete-message", {
            msg: "Message not found",
            code: 3,
          });
        }
        if (!room) {
          return socket.emit("error-message", {
            msg: "Room not found",
            code: 3,
          });
        }
        if ((message.img.length > 0)) {
          const promise = message.img.map(async (urlImageRemove, index) => {
            const fileUrl = urlImageRemove.split("/");
            const originalName = fileUrl[5].split("?")[0];
            const path = fileUrl[4] + "/" + originalName;
            await deleteFile(path);
          });
          await Promise.all(promise);
        }
        await Message.findOneAndDelete({
          _id: messageId,
          from: socket.user.id,
          to: roomId,
        });
        io.to(roomId).emit("delete-message", roomId, messageId);
        if (message._id.toString() === lastMessage._id.toString()) {
          const newLast = await Message.findOne({
            to: roomId,
          }).sort({
            createdAt: -1,
          });
          room.listUser.map((item) => {
            if (item !== socket.user.id) {
              io.to(item).emit(
                "delete-last",
                newLast,
                roomId,
                lastMessage._id.toString()
              );
            }
          });
          socket.emit(
            "delete-last",
            newLast,
            roomId,
            lastMessage._id.toString()
          );
        }
      } catch (error) {
        console.error(error);
        socket.emit("error-message", { msg: "Server error", code: 4 });
      }
    });
  });
};
export const getMessageRoomForUserId = async (req, res) => {
  try {
    const messageRoom = await MessageRoom.find({
      listUser: req.userId.id,
    });
    if (!messageRoom) {
      return res
        .status(404)
        .json({ message: "messageRoom not exist", code: 1 });
    }
    const lastMessage = messageRoom.map(async (item, index) => {
      const lastMsg = await Message.findOne({ to: item._id }).sort({
        createdAt: -1,
      });
      const user = await User.findOne({
        _id: item.listUser.filter((item) => item !== req.userId.id),
      }).select({
        _id: 1,
        username: 1,
        img: 1,
        displayname: 1,
      });
      return { ...item, lastMess: lastMsg, user: user };
    });
    const listData = await Promise.all(lastMessage);
    const data = listData.map((item) => ({
      lastMess: item.lastMess,
      room: item._doc,
      user: item.user,
    }));

    data.sort((a, b) => {
      const aIsReadIncludesUser = a?.lastMess?.isRead.includes(req.userId.id);
      const bIsReadIncludesUser = b?.lastMess?.isRead.includes(req.userId.id);

      // Nếu a không chứa userId mà b chứa userId thì a lên đầu
      if (!aIsReadIncludesUser && bIsReadIncludesUser) return -1;
      // Nếu b không chứa userId mà a chứa userId thì b lên đầu
      if (aIsReadIncludesUser && !bIsReadIncludesUser) return 1;
      // Nếu cả hai cùng chứa hoặc không chứa userId thì giữ nguyên thứ tự
    });
    data.sort((a, b) => {
      if (a?.lastMess?.createdAt && !b?.lastMess?.createdAt) return -1; // a có lastMess, b không có -> a lên trước
      if (!a?.lastMess?.createdAt && b?.lastMess?.createdAt) return 1; // b có lastMess, a không có -> b lên trước
      const aCreated = new Date(a?.lastMess?.createdAt);
      const bCreated = new Date(b?.lastMess?.createdAt);
      return bCreated - aCreated;
    });
    // data.sort((a, b) => {
    //   // Kiểm tra sự tồn tại của lastMess

    //   // Sắp xếp
    //   if (a.lastMess && !b.lastMess) return -1; // a có lastMess, b không có -> a lên trước
    //   if (!a.lastMess && b.lastMess) return 1; // b có lastMess, a không có -> b lên trước
    //   return 0; // Cả hai đều có hoặc không có lastMess, giữ nguyên thứ tự
    // });
    return res.status(200).json({ message: "Success", data: data, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const readMessage = (io, socket) => {
  socket.on("read-message", async (roomId, messageId, userId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const owner = await User.findOne({ _id: userId });
        if (!owner) {
          return socket.emit("error-message", {
            msg: "Message not found",
            code: 3,
          });
        }
        const message = await Message.findOne({
          _id: messageId,
        });
        if (!message) {
          return socket.emit("error-message", {
            msg: "Message not found",
            code: 3,
          });
        }
        if (!message.isRead.includes(userId)) {
          message.isRead = [...message.isRead, userId];
        }
        await message.save();
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomId)) {
          socket.join(roomId);
        }
        socket.emit("top-message", message);
        io.to(roomId).emit("read-message", message);
      } catch (error) {
        console.error(error);
        socket.emit("error-message", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const getMessageRoomForUserIdSearch = async (req, res) => {
  const qSearch = req.query.qSearch;
  try {
    const messageRoom = await MessageRoom.find({
      listUser: req.userId.id,
    });
    if (!messageRoom) {
      return res
        .status(404)
        .json({ message: "messageRoom not exist", code: 1 });
    }
    const lastMessage = messageRoom.map(async (item, index) => {
      const lastMsg = await Message.findOne({ to: item._id }).sort({
        createdAt: -1,
      });
      const user = await User.findOne({
        _id: item.listUser.filter((item) => item !== req.userId.id),
        $or: [
          { username: { $regex: qSearch, $options: "i" } },
          { displayname: { $regex: qSearch, $options: "i" } },
        ],
      }).select({
        _id: 1,
        username: 1,
        img: 1,
        displayname: 1,
      });
      if (user) {
        return { ...item, lastMess: lastMsg, user: user };
      }
    });
    const listData = await Promise.all(lastMessage);
    const filter = listData.filter((value) => value !== undefined);

    const data = filter.map((item) => ({
      lastMess: item.lastMess,
      room: item._doc,
      user: item.user,
    }));
    return res.status(200).json({ message: "Success", data: data, code: 0 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const sendMess = async (req, res) => {
  const roomId = req.body.roomId;
  const content = req.body.content;
  const file = req.files;
  const time = new Date().getTime();

  try {
    if (!content && file.length <= 0) {
      return res.status(400).json({ message: "Không có thông tin", code: 8 });
    }
    const owner = await User.findOne({ _id: req.userId.id });
    await Promise.all([owner]);
    if (!owner) {
      return res
        .status(404)
        .json({ message: "Người dùng không tồn tại", code: 9 });
    }
    const room = await MessageRoom.findOne({ _id: roomId });
    if (!room) {
      return res
        .status(404)
        .json({ message: "Không có phòng chat này", code: 10 });
    }
    const promises = file.map(async (file, index) => {
      const url = await uploadFileMessage(
        file,
        index,
        time,
        req.userId.id,
        "room"
      );
      return url;
    });
    const urlFile = await Promise.all(promises);

    const newMessage = new Message({
      from: req.userId.id,
      to: roomId,
      content: content ? content : "",
      isRead: [req.userId.id],
      img: urlFile,
      filePath: `room-${roomId}-`,
    });
    await newMessage.save();
    io.to(roomId).emit("send-message", newMessage, roomId);
    // Notify other users in the room
    room.listUser.forEach((userId) => {
      io.to(userId).emit("new-last", newMessage);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};

export const sendMessFirst = async (req, res) => {
  const roomId = req.body.roomId;
  const content = req.body.content;
  const file = req.files;
  const time = new Date().getTime();

  try {
    if (!content && file.length <= 0) {
      return res.status(400).json({ message: "Không có thông tin", code: 8 });
    }
    const owner = await User.findOne({ _id: req.userId.id }).select({
      _id: 1,
      username: 1,
      img: 1,
      displayname: 1,
    });
    if (!owner) {
      return res
        .status(404)
        .json({ message: "Người dùng không tồn tại", code: 9 });
    }
    const user = await User.findOne({ _id: roomId }).select({
      _id: 1,
      username: 1,
      img: 1,
      displayname: 1,
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Người dùng không tồn tại", code: 9 });
    }
    const newMessageRoom = new MessageRoom({
      listUser: [req.userId.id, roomId],
      type: "single",
    });
    await newMessageRoom.save();
    const promises = file.map(async (file, index) => {
      const url = await uploadFileMessage(
        file,
        index,
        time,
        req.userId.id,
        "room"
      );
      return url;
    });
    const urlFile = await Promise.all(promises);

    const newMessage = new Message({
      from: req.userId.id,
      to: newMessageRoom._id.toString(),
      content: content ? content : "",
      isRead: [req.userId.id],
      img: urlFile,
      filePath: `room-${newMessageRoom._id.toString()}-`,
    });

    await newMessage.save();
    io.to(req.userId.id).emit("new-room", newMessageRoom, newMessage, roomId);
    io.to(roomId).emit("new-room", newMessageRoom, newMessage, roomId);
    io.to(roomId).emit("new-card", {
      room: newMessageRoom,
      lastMess: newMessage,
      user: owner,
    });
    io.to(req.userId.id).emit("new-card", {
      room: newMessageRoom,
      lastMess: newMessage,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", code: 4 });
  }
};
