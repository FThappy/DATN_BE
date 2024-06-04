import mongoose from "mongoose";

const TranscationSchema = new mongoose.Schema(
  {
    projectId: { type: String },
    money: { type: Number },
    createBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transcation", TranscationSchema);
