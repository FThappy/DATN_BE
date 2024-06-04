import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    projectName: { type: String, required: true },
    timeEnd: { type: Date },
    city: { type: String, required: true },
    description: { type: String },
    content: { type: String },
    filePath: { type: String },
    type: { type: Array },
    rise: { type: Number },
    goal: { type: Number },
    cardNumber: {type : String},
    image: { type: Array },
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

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
