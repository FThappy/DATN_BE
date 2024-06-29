import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    document: { type: String },
    img: { type: Array },
    organizationId: { type: String },
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
    typeShare: {
      type: String,
    },
    linkItem: { type: String },
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", PostSchema);
export default Post;
