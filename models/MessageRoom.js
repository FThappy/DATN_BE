import mongoose from "mongoose";

const MessageRoomSchema = new mongoose.Schema(
  {
    listUser: { type: Array, required: true },
    type: {
      type: String,
      required: true,
      enum: ["group","single"],
    },
  },
  { timestamps: true }
);
const MessageRoom = mongoose.model("MessageRoom", MessageRoomSchema);
export default MessageRoom;
