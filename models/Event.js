import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    eventName: { type: String, required: true },
    timeStart: { type: Date },
    timeEnd: { type: Date },
    city: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    filePath: { type: String },
    wallImg: { type: Array },
    isLock: {
      type: Boolean,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Event = mongoose.model("Event", EventSchema);
export default Event;
