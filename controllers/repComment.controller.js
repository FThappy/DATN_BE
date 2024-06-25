import Comment from "../models/Comment.js";
import RepComment from "../models/RepComment.js";
import User from "../models/User.js";
import { authenticateToken } from "./comment.controller.js";

// REP-COMMENT

export const repComment = (io, socket) => {
  socket.on("rep-comment", async (itemId, comment, toUserId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const commentFarther = await Comment.findOne({ _id: itemId });
        if (!commentFarther) {
          return socket.emit("error-comment", {
            msg: "Comment Farther not found",
            code: 3,
          });
        }
        const user = await User.findOne({ _id: socket.user.id });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(itemId)) {
          socket.join(itemId);
        }
        const newComment = new RepComment({
          itemId: itemId,
          userId: socket.user.id,
          toUserId: toUserId,
          detail: comment,
        });
        await newComment.save();
        if (commentFarther.repLength) {
          commentFarther.repLength = commentFarther.repLength + 1;
        } else {
          commentFarther.repLength = 1;
        }
        await commentFarther.save();
        io.to(itemId).emit("new-rep-comment", newComment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const loadMoreRepComment = (io, socket) => {
  socket.on("load-repcomment-more", async (itemId, page, skipItem) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      const rooms = Array.from(socket.rooms);
      if (!rooms.includes(itemId)) {
        console.log("abc");
        socket.join(itemId);
      }
      try {
        const post = await Comment.findOne({ _id: itemId });
        if (!post) {
          socket.emit("error-comment", { msg: "Not found post", code: 3 });
        }
        const skipRepComment = page * 5 + skipItem;
        const listRepComment = await RepComment.find({ itemId: itemId })
          .sort({ _id: -1 })
          .skip(skipRepComment)
          .limit(5);
        socket.emit("load-repcomment-more", listRepComment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};

export const changeRepComment = (io, socket) => {
  socket.on("change-rep-comment", async (commentId, newDetail, itemId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const user = await User.findOne({ _id: socket.user.id });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }
        const comment = await RepComment.findOne({
          _id: commentId,
          userId: socket.user.id,
        });
        if (!comment) {
          socket.emit("error-comment", {
            msg: "Not found comment",
            code: 3,
          });
        }
        comment.detail = newDetail;
        comment.__v = comment.__v + 1;
        await comment.save();
        io.to(itemId).emit("change-rep-comment", comment);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};
export const deleteRepComment = (io, socket) => {
  socket.on("delete-rep-comment", async (commentId, commentFatherId) => {
    authenticateToken(socket, async (err) => {
      if (err) {
        return;
      }
      try {
        const user = await User.findOne({ _id: socket.user.id });
        if (!user) {
          return socket.emit("error-comment", {
            msg: "User not found",
            code: 3,
          });
        }
        const comment = await RepComment.findOne({
          _id: commentId,
          userId: socket.user.id,
        });
        if (!comment) {
          socket.emit("error-comment", { msg: "Not found comment", code: 3 });
        }
        await RepComment.findOneAndDelete({
          _id: commentId,
          userId: socket.user.id,
        });
        const commentFarther = await Comment.findOne({ _id: commentFatherId });
        if (!commentFarther) {
          return socket.emit("error-comment", {
            msg: "Comment Farther not found",
            code: 3,
          });
        }
        commentFarther.repLength = commentFarther.repLength - 1;
        await commentFarther.save();
        io.to(commentFatherId).emit("delete-rep-comment", commentId);
        // io.to(itemId).emit("delete-comment", commentId);
      } catch (error) {
        console.error(error);
        socket.emit("error-comment", { msg: "Server error", code: 4 });
      }
    });
  });
};
