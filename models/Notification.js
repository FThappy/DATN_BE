import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to : { type: String, required: true},
    content: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["addFriend", "comment", "auth", "transcation","acceptFriend","event"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
