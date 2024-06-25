import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);
const Like = mongoose.model("Like", LikeSchema);
export default Like;
