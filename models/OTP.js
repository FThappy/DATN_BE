import mongoose from "mongoose";



const OTPSchema = new mongoose.Schema(
  {
    otp: { type: String },
    email: { type: String },
    type: {
      type: String,
      enum: ["register", "password_reset", "username_reset", "forgot_password" ,"email_reset","check_new_mail"],
      required: true,
    },
  },
  { timestamps: true }
);
const OTP = mongoose.model("OTP", OTPSchema);
export default  OTP ;
