import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const NUMBER_COMMENT = 8;

// io.use((socket, next) => {

// });

const authenticateToken = (socket, next) => {
  const handshake = socket.handshake;
  console.log("a");
  if (!handshake.headers.cookie) {
    return socket.emit("error-global", {
      msg: "Chưa xác thực người dùng",
      code: 4,
    });
  }
  const rawToken = handshake.headers.cookie;
  const tmpToken = rawToken.split(";")[0];
  const token = tmpToken.split("=")[1];
  jwt.verify(token, process.env.JWT_SEC, async (err, id) => {
    if (err) {
      socket.emit("error-global", {
        msg: "Hết phiên đăng nhập",
        code: 4,
      });
      next(new Error("not invalid token"));
    }
    next();
  });
};

// export const joniRoom = (io, socket) => {
//   socket.on("join-room", async (room, page) => {
//     console.log(room)
//     try {
//       const post = await Post.findOne({ _id: room });
//       if (!post) {
//         socket.emit("error-comment", { msg: "Not found post", code: 3 });
//       }
//       socket.join(room);
//       const skipComment = 0 * NUMBER_COMMENT;
//       const listComment = await Comment.find({ itemId: room })
//         .sort({ _id: -1 })
//         .skip(skipComment)
//         .limit(8);
//       socket.emit("comment-room", listComment);
//     } catch (error) {
//       console.log(error);
//       socket.emit("error-comment", { message: "Server error", code: 4 });
//     }
//   });
// };
export const joniRoom = (io, socket) => {
  socket.on("join-room", async (room, page) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const post = await Post.findOne({ _id: room });
        if (!post) {
          socket.emit("error-comment", { msg: "Not found post", code: 3 });
          return;
        }

        socket.join(room);
        const skipComment = 0 * NUMBER_COMMENT;
        const listComment = await Comment.find({ itemId: room })
          .sort({ _id: -1 })
          .skip(skipComment)
          .limit(8);
        socket.emit("comment-room", listComment);
      } catch (error) {
        console.log(error);
        socket.emit("error-comment", { message: "Server error", code: 4 });
      }
    });
  });
};
export const sendComment = (io, socket) => {
  socket.on("send-comment", async (itemId, userId, comment) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const post = await Post.findOne({ _id: itemId });
        if (!post) {
          return socket.emit("error-comment", {
            msg: "Post not found",
            code: 3,
          });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }

        const newComment = new Comment({
          itemId: itemId,
          userId: userId,
          detail: comment,
        });
        await newComment.save();
        io.to(itemId).emit("new-comment", newComment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};
export const loadMoreComment = (io, socket) => {
  socket.on("load-more", async (itemId, page, skipItem) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const post = await Post.findOne({ _id: itemId });
        if (!post) {
          socket.emit("error-comment", { msg: "Not found post", code: 3 });
        }
        const skipComment = page * NUMBER_COMMENT + skipItem;
        const listComment = await Comment.find({ itemId: itemId })
          .sort({ _id: -1 })
          .skip(skipComment)
          .limit(8);
        socket.emit("load-more", listComment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};
export const changeComment = (io, socket) => {
  socket.on("change-comment", async (commentId, newDetail, itemId, userId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }
        const comment = await Comment.findOne({
          _id: commentId,
          userId: userId,
        });
        if (!comment) {
          socket.emit("error-comment", {
            msg: "Not found comment",
            code: 3,
          });
        }
        comment.detail = newDetail;
        await comment.save();
        io.to(itemId).emit("change-comment", comment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};
export const deleteComment = (io, socket) => {
  socket.on("delete-comment", async (commentId, userId, itemId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        console.log(userId, commentId);
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }
        const comment = await Comment.findOne({
          _id: commentId,
          userId: userId,
        });
        if (!comment) {
          socket.emit("error-comment", { msg: "Not found comment", code: 3 });
        }
        await Comment.findOneAndDelete({ _id: commentId });
        io.to(itemId).emit("delete-comment", commentId);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const leaveRoom = (io, socket) => {
  socket.on("leave-room", (itemId) => {
    socket.leave(itemId);
  });
};
