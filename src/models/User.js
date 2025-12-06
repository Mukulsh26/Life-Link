import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    // 🔥 FIX: REMOVE required, add default: null
    password: { type: String, required: false},
    state: { type: String, required: false},
    city: { type: String, required: false},
    pincode: { type: String, required: false},
    address: { type: String, required: false},


    role: {
      type: String,
      enum: ["donor", "hospital", "admin"],
      default: "donor",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    bloodGroup: { type: String, default: null },
    city: { type: String, default: null },
    lastDonationDate: { type: Date, default: null },

    hospitalName: { type: String, default: null },
    contactNumber: { type: String, default: null },

    deviceToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
