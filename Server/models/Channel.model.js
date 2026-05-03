import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, default: "Hash" },
    desc: { type: String, default: "" },
  },
  { timestamps: true }
);

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
