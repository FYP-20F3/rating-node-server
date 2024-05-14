import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    complaintStatus: {
      type: String,
      enum: ["pending", "resolved", "unresolved", "reopened"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
