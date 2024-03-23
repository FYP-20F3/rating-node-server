import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    customerId: {
      //   type: mongoose.Schema.Types.ObjectId,
      type: String,
      //   ref: "Customer",
      required: true,
    },
    businessId: {
      //   type: mongoose.Schema.Types.ObjectId,
      type: String,
      //   ref: "Business",
      required: true,
    },
    reviewSource: {
      type: String,
      // required: true,
    },
    reviewRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewType: {
      type: String,
      required: true,
    },
    reviewTitle: {
      type: String,
      required: true,
    },
    reviewDescription: {
      type: String,
      required: true,
      min: 4,
      max: 100,
    },
    dateOfExperience: {
      type: Date,
      default: Date.now,
    },
    Sentiment: {
      type: String,
      default: "Neutral",
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewReply',
    }]    
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
