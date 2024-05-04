import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 50,
    },
    businessCategory: {
      type: String,
      required: true,
    },
    businessDescription: {
      type: String,
      default: "",
    },
    businessLogoPath: {
      type: String,
      default: "",
    },
    websiteAddress: String,
    location: {
      type: String,
      default: "",
    },
    overallRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    block: {
      type: Boolean,
      default: false,
    },
    blockTimeStamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Business = mongoose.model("Business", BusinessSchema);
export default Business;
