import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    itemId: { type: String },
    userID : { type: String },
    type: { type: String },
    reason: { type: Array },
    detail: {type : String}
  },
  { timestamps: true }
);
const Report = mongoose.model("Report", ReportSchema);
export default Report;
