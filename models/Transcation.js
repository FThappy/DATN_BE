import mongoose from "mongoose";

const TranscationSchema = new mongoose.Schema(
  {
    projectId: { type: String },
    userId: { type: String },
    amount: { type: Number },
  },
  { timestamps: true }
);

const Transcation = mongoose.model("Transcation", TranscationSchema);
export default Transcation;
