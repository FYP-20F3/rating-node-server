import mongoose from 'mongoose';

const reviewReplySchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Review' // Assuming your review model is named 'Review'
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business' // Assuming your business model is named 'Business'
  },
  replyDescription: {
    type: String,
    required: true,
  },
  replyDate: {
    type: Date,
    default: Date.now
  }
});

const ReviewReply = mongoose.model('ReviewReply', reviewReplySchema);
export default ReviewReply;