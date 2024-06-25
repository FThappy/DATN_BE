import mongoose from "mongoose";

const RequestAddFriendSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { timestamps: true }
);
const RequestAddFriend = mongoose.model("RequestAddFriend", RequestAddFriendSchema);
export default RequestAddFriend;
