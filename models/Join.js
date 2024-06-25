import mongoose from "mongoose";

const JoinSchema = new mongoose.Schema(
  {
    itemId: { type: String },
    userId: { type: String },
  },
  {
    timestamps: true,
  }
);
const Join = mongoose.model("Join", JoinSchema);
export default Join;
