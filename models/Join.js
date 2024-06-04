import mongoose from "mongoose";

const JoinSchema = new mongoose.Schema(
  {
    itemId: { type: String },
    userId: { type: String },
    type: { type: String },
  },
  {
    timestamps: true,
    indexes: [
      // Thêm chỉ mục kết hợp cho `itemId` và `userId`
      { fields: { itemId: 1, userId: 1 }},
      // Thêm chỉ mục cho `type`
      { fields: { type: 1 } },
    ],
  }
);
const Join = mongoose.model("Join", JoinSchema);
export default Join;
