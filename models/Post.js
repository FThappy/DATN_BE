import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    organizationId: { type: String },
    document: { type: String },
    img: { type: Array },
    filePath: { type: String },
    privacy: {
      type: String,
      default: "global",
    },
    isLock: {
      type: Boolean,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    }
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", PostSchema);
export default Post;
