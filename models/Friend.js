import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema(
  {
    friend: { type: Array, required: true }
  },
  { timestamps: true }
);
const Friend = mongoose.model(
  "Friend",
  FriendSchema
);
export default Friend;
