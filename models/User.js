import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birth: { type: Date },
    displayname: { type: String },
    phone: { type: String },
    type: { type: String },
    address: { type: String },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isLock: {
      type: Boolean,
      default: false,
    },
    img: { type: String },
    wall: { type: String },
    card: { type: String },
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);
export default User;
