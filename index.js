import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";
import reportRoute from "./routes/report.route.js";
import eventRoute from "./routes/event.route.js";
import projectRoute from "./routes/project.route.js";
import transcationRoute from "./routes/transcation.route.js";
import requestAddFriendRoute from "./routes/requestAddFriend.route.js";
import friendRoute from "./routes/friend.route.js";
import notificationRoute from "./routes/notification.route.js";
import likeRoute from "./routes/like.route.js";
import messageRoute from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import {
  changeComment,
  deleteComment,
  joniRoom,
  leaveRoom,
  loadMoreComment,
  sendComment,
} from "./controllers/comment.controller.js";
import {
  acceptRequestAddFriend,
  createReqAddFriend,
} from "./controllers/requestAddFriend.controller.js";
import {
  joinRoomNotification,
  removeNotification,
} from "./controllers/notification.controller.js";
import {
  changeRepComment,
  deleteRepComment,
  loadMoreRepComment,
  repComment,
} from "./controllers/repComment.controller.js";
import { deleteMessage, joinMessRoom, readMessage, sendFirstMessage, sendMessage } from "./controllers/messenger.controller.js";
const app = express();
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DBConnection Successfull"))
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: ["http://localhost:3000", "https://qcgateway.zalopay.vn"],
    // origin: "https://datn-fe-3xyo.onrender.com",
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cookie: true,
  cors: {
    origin: "http://localhost:3000",
    // origin: "https://datn-fe-3xyo.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const onConnection = (socket) => {
  joniRoom(io, socket);
  sendComment(io, socket);
  loadMoreComment(io, socket);
  changeComment(io, socket);
  deleteComment(io, socket);
  leaveRoom(io, socket);
  repComment(io, socket);
  loadMoreRepComment(io, socket);
  deleteRepComment(io, socket);
  changeRepComment(io, socket);
  createReqAddFriend(io, socket);
  acceptRequestAddFriend(io, socket);
  joinRoomNotification(io, socket);
  removeNotification(io, socket);
  sendFirstMessage(io, socket);
  joinMessRoom(io, socket);
  sendMessage(io, socket);
  deleteMessage(io, socket);
  readMessage(io, socket);
};
// io.use((socket, next) => {
//   const handshake = socket.handshake;

//   if (!handshake.headers.cookie){
//     return socket.emit("error-global", {
//       msg: "Chưa xác thực người dùng",
//       code: 4,
//     });}
//   const rawToken = handshake.headers.cookie;
//   const tmpToken = rawToken.split(";")[0];
//   const token = tmpToken.split("=")[1]
//   jwt.verify(token, process.env.JWT_SEC, async (err, id) => {
//     if (err){
//        socket.emit("error-global", {
//         msg: "Hết phiên đăng nhập",
//         code: 4,
//       })
//       next(new Error("not invalid token"));
//       ;}
//     next();
//   });
// });
io.on("connection", onConnection);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/user", userRoute);
app.use("/api/report", reportRoute);
app.use("/api/event", eventRoute);
app.use("/api/project", projectRoute);
app.use("/api/transcation", transcationRoute);
app.use("/api/reqAddFriend", requestAddFriendRoute);
app.use("/api/friend", friendRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/like", likeRoute);
app.use("/api/message", messageRoute);


server.listen(5000, () => {
  console.log("Backend sever is running !");
});
