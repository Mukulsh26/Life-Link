import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    // Hospital user who created the request
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Required blood group (A+, O− etc.)
    bloodGroup: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },

    // City name for matching donors
    city: { type: String, required: true },

    notes: { type: String },

    status: {
      type: String,
      enum: ["active", "fulfilled", "cancelled"],
      default: "active",
    },

    responders: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
