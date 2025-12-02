import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true }, // hashed password

    role: {
      type: String,
      enum: ["donor", "hospital", "admin"],
      default: "donor",
    },

    // For donors
    bloodGroup: { type: String },
    city: { type: String },
    lastDonationDate: { type: Date },

    // For hospitals
    hospitalName: { type: String },
    contactNumber: { type: String },

    // Push notifications (later when you add FCM)
    deviceToken: { type: String },
  },
  { timestamps: true }
);

// Fix hot-reload model overwrite issue
export default mongoose.models.User || mongoose.model("User", UserSchema);
