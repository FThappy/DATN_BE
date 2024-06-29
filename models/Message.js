import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    content: { type: String },
    isRead: {
      type: Array,
    },
    filePath: { type: String },
    img: { type: Array },
  },
  { timestamps: true }
);
const Message = mongoose.model("Message", MessageSchema);
export default Message;
