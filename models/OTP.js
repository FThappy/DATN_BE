import mongoose from "mongoose";



const OTPSchema = new mongoose.Schema(
  {
    otp: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);
const OTP = mongoose.model("OTP", OTPSchema);
export default  OTP ;
