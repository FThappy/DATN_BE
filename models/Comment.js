import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    detail: { type: String },
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
