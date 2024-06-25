import mongoose from "mongoose";

const RepCommentSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    toUserId: { type: String, required: true},
    detail: { type: String },
  },
  { timestamps: true }
);
const RepComment = mongoose.model("RepComment", RepCommentSchema);
export default RepComment;
