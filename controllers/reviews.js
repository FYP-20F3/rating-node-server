import Business from "../models/Business.js";
import Review from "../models/Review.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReviewReply from "../models/ReviewReply.js";
import Customer from "../models/Customer.js";
import Complaint from "../models/Complaint.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

// configure dotenv
dotenv.config();

/* CREATE */
export const createReview = async (req, res) => {
  try {
    let {
      customerId,
      businessId,
      reviewRating,
      reviewType,
      reviewTitle,
      reviewDescription,
      dateOfExperience,
    } = req.body;

    // manual
    // const reviewSentiment =
    //   reviewRating > 3 ? "Positive" : reviewRating < 3 ? "Negative" : "Neutral";

    // console.log(reviewSentiment);

    // Calculate review sentiment
    const reviewSentiment = await reviewSemanticAnalysis(reviewDescription);

    // // Detect review authenticity
    const detectReview = await fakenessDetection(reviewDescription);
    if (detectReview.semantics == " Fake" || detectReview.semantics == null) {
      return res.status(300).json({
        semantics: detectReview.semantics,
        suggestions: detectReview.details.suggestions,
      });
    }

    // Check if review should be classified as complain
    const reviewClassification = reviewRating < 3 ? "complain" : "review";

    // Create the new review
    const newReview = new Review({
      customerId,
      businessId,
      reviewRating,
      reviewType,
      reviewTitle,
      reviewDescription,
      dateOfExperience,
      Sentiment: reviewSentiment,
      reviewClassification,
    });

    // Save the review
    const savedReview = await newReview.save();

    if (savedReview) {
      const business = await Business.findOne({ _id: businessId });

      const reviews = await Review.find({ businessId });

      // Calculate the average rating
      let totalRating = 0;
      reviews.forEach((review) => {
        totalRating += review.reviewRating;
      });
      const averageRating = totalRating / reviews.length;

      // Trim the average rating to 2 decimal places
      const trimmedAverageRating = parseFloat(averageRating.toFixed(1));

      // Update the overallRating of the business
      business.overallRating = trimmedAverageRating;
      await business.save();
    }

    // If review is classified as complain, add entry to Complaint collection
    if (reviewClassification === "complain") {
      const newComplaint = new Complaint({
        reviewId: savedReview._id,
        complaintStatus: "pending",
      });
      const savedComplaint = await newComplaint.save();

      // Add entry to Chat collection
      const newChat = new Chat({
        members: [
          {
            customer: new ObjectId(customerId),
            business: new ObjectId(businessId),
            complaintId: savedComplaint._id,
          },
        ],
      });
      const savedChat = await newChat.save();

      // Add entry to Message collection
      const newMessage = new Message({
        chatId: savedChat._id,
        senderId: customerId,
        message: reviewDescription,
        complaintId: savedComplaint._id,
      });
      await newMessage.save();
    }

    res.status(201).json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(409).json({ msg: error.message });
  }
};

/* READ */
export const getCustomerReviews = async (req, res) => {
  try {
    const id = req.params.customerId;
    const reviews = await Review.find({ customerId: id });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBusinessReviews = async (req, res) => {
  try {
    const id = req.params.businessId;
    const reviews = await Review.find({ businessId: id });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Search and filter reviews
export const searchAndFilterReviews = async (req, res) => {
  try {
    const { keyword, rating, category, sort, reply } = req.query;
    const businessId = req.params.businessId;
    let populatedReviews = [];

    let query = {};

    if (businessId && businessId !== "null" && businessId !== "undefined") {
      query.businessId = businessId;
    }

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (rating && rating !== -1) {
      query.reviewRating = rating;
    }

    if (category) {
      if (category === "all") {
        query.reviewType = { $ne: "all" };
      } else {
        query.reviewType = category;
      }
    }

    // console.log(query);
    const options = {}; // Options for sorting

    if (sort) {
      options.createdAt = sort === "new" ? -1 : 1;
    }

    const reviews = await Review.find(query, { __v: 0 })
      .populate("customerId", "firstName lastName email picturePath block")
      .populate("businessId", "businessName")
      .sort(options) // Apply sorting
      .exec();

    // console.log(reviews);
    let processedReviews = await reviewsWithReply(reviews);

    // Filter reviews based on the 'reply' query parameter
    if (reply === "true") {
      processedReviews = processedReviews.filter(
        (review) => review.reviewReply !== null
      );
    } else if (reply === "false") {
      processedReviews = processedReviews.filter(
        (review) => review.reviewReply === null
      );
    } else if (reply === "all") {
      processedReviews = processedReviews;
    }

    populatedReviews.push(...processedReviews);

    // for (const review of processedReviews) {
    //   const customer = await Customer.findOne(
    //     { _id: review.customerId },
    //     {
    //       password: 0,
    //       createdAt: 0,
    //       updatedAt: 0,
    //       _id: 0,
    //       __v: 0,
    //     }
    //   );
    //   review.customer = customer;
    //   populatedReviews.push(review);
    // }

    res.json(populatedReviews);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const toggleBlockReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body;

    // Check if reviewId and action are provided
    if (!reviewId || !action) {
      return res.status(400).json({ msg: "Review ID and action are required" });
    }

    // Find the review by ID
    const review = await Review.findById(reviewId);

    // Check if review exists
    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    // Perform the requested action
    if (action === "block") {
      // Block the review
      await Review.findByIdAndUpdate(reviewId, { block: true });
      res.status(200).json({
        msg: `Review ${review.reviewTitle} ${review.reviewTitle} blocked successfully`,
      });
    } else if (action === "unblock") {
      // Unblock the review
      await Review.findByIdAndUpdate(reviewId, { block: false });
      res.status(200).json({
        msg: `Review ${review.reviewTitle} ${review.reviewTitle} unblocked successfully`,
      });
    } else {
      return res.status(400).json({ msg: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if reviewId is provided
    if (!reviewId) {
      return res.status(400).json({ msg: "Review ID is required" });
    }

    // Find and delete the review by ID
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    // Check if review exists
    if (!deletedReview) {
      return res.status(404).json({ msg: "Review not found" });
    }

    res.status(200).json({
      msg: `Review ${deletedReview.reviewTitle} ${deletedReview.reviewTitle} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// util functions
const reviewsWithReply = async (reviews) => {
  const reviewIds = reviews.map((review) => review._id);
  const reviewReplies = await ReviewReply.find({
    reviewId: { $in: reviewIds },
  });
  const processedReviews = reviews.map((review) => {
    const repliedObject = reviewReplies.find((reply) =>
      reply.reviewId.equals(review._id)
    );
    const processedReview = review.toObject();

    if (repliedObject !== undefined) {
      processedReview.reviewReply = repliedObject;
      return processedReview;
    } else {
      processedReview.reviewReply = null;
      return processedReview;
    }
  });
  return processedReviews;
};

// const reviewsWithReply = async (reviews) => {
//   const reviewIds = reviews.map((review) => review._id);
//   const reviewReplies = await ReviewReply.find({
//     reviewId: { $in: reviewIds },
//   });
//   const processedReviews = reviews.map((review) => {
//     const repliesArray = reviewReplies.filter((reply) =>
//       reply.reviewId.equals(review._id)
//     );
//     const processedReview = review.toObject();

//     if (repliesArray.length > 0) {
//       processedReview.reviewReplies = repliesArray;
//     } else {
//       processedReview.reviewReplies = null;
//     }
//     return processedReview;
//   });
//   return processedReviews;
// };

export const countBusinessReviews = async (businessId) => {
  // console.log(businessId);
  try {
    const count = await Review.countDocuments({ businessId: businessId });
    // console.log(`Number of reviews for business ${businessId}: ${count}`);
    return count;
  } catch (error) {
    console.error("Error counting reviews:", error.message);
  }
};

export const countReviewsCategoryWise = async (businessId) => {
  // console.log(businessId);
  try {
    const count = await Review.find({ businessId: businessId });
    // console.log(`Number of reviews for business ${businessId}: ${count}`);
    return count;
  } catch (error) {
    console.error("Error counting reviews:", error.message);
  }
};

export const countBusinessRatingReviews = async (businessId, rating) => {
  // console.log(businessId);
  try {
    const count = await Review.countDocuments({
      businessId: businessId,
      reviewRating: rating,
    });
    // console.log(
    //   `Number of ${rating} star reviews for business ${businessId}: ${count}`
    // );
    return count;
  } catch (error) {
    console.error("Error counting reviews:", error.message);
  }
};

export async function reviewSemanticAnalysis(reviewDescription) {
  try {
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0,
      topP: 0.1,
      topK: 16,
    };

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig,
    });

    const prompt = `Please Analyze the following review and classify it as positive, negative, or neutral with one word.`;

    const promptText = prompt + "\n" + reviewDescription;

    const result = await model.generateContent(promptText);
    const reviewSemantics = result.response.text();
    console.log(reviewSemantics);
    return reviewSemantics;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fakenessDetection(reviewDescription) {
  try {
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0,
      topP: 0.1,
      topK: 16,
    };

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig,
    });

    const prompt = `Please analyze the following review and assess its authenticity:

    Review: "${reviewDescription}"
    
    **Authenticity:**
    
    * Detailed description of personal experience (Yes/No)
    * Mention of specific features or aspects (Yes/No)
    * Language consistent with genuine opinions (Yes/No)
    
    **Overall Judgment:**
    
    * If all three conditions are "No", mark the review as "Fake".
    * If two or three conditions are "Yes", mark the review as "Likely Authentic".
    * If only one condition is "Yes", the review is "Uncertain and mark it as "Fake".
    
    **Suggestions (Optional):**
    
    If the review is marked as "Fake" or "Uncertain", provide suggestions to improve its authenticity (e.g., adding details, mentioning specific features).
    `;

    const authenticExample = `Output for 'Authentic' Review:\nAuthentic\nExplanation:\n1. [Explanation 1]\n2. [Explanation 2]\n`;
    const fakeExample = `Output for 'Fake' Review:\nFake\nSuggestions:\n1. [Suggestion 1]\n2. [Suggestion 2]\n3. [Suggestion 3]\n`;

    const promptText = prompt + "\n" + authenticExample + "\n" + fakeExample;
    // console.log(promptText);

    const result = await model.generateContent(promptText);
    const content = result.response.text();
    console.log(content, "content");

    // Parse the response to extract relevant information
    const lines = content.split("\n");
    let verdict = null;
    let suggestions = null;
    let explanation = null;

    // Iterate through the lines to find the verdict, explanation, and suggestions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("**Overall Judgment:**")) {
        // Extract the overall judgment
        verdict = line.substring(line.lastIndexOf(":") + 1).trim();
        // Remove any extra formatting (e.g., '**') from the verdict
        verdict = verdict.replace(/\*\*/g, "");
        console.log("Verdict:", verdict);
      } else if (line.startsWith("**Suggestions:**")) {
        // Extract the suggestions
        suggestions = [];
        i++; // Move to the next line for the suggestion details
        while (i < lines.length && lines[i].trim() !== "") {
          suggestions.push(lines[i].trim());
          i++;
        }
      } else if (line.startsWith("**Explanation:**")) {
        // Extract the explanation
        explanation = [];
        i++; // Move to the next line for the explanation details
        while (i < lines.length && lines[i].trim() !== "") {
          explanation.push(lines[i].trim());
          i++;
        }
      }
    }

    // Log the extracted information for debugging
    console.log("Verdict:", verdict);
    console.log("Suggestions:", suggestions);
    console.log("Explanation:", explanation);

    // **Return the response as an object with conditional properties**
    return {
      semantics: verdict,
      details: {
        suggestions: suggestions ? suggestions : null, // Include only if there are suggestions
        explanation: explanation ? explanation : null, // Include only if there is an explanation
      },
    };

    // Log the extracted information for debugging
    console.log("Verdict:", verdict);
    console.log("Suggestions:", suggestions);
    console.log("Explanation:", explanation);

    // **Return the response as an object with conditional properties**
    return {
      semantics: verdict,
      details: {
        suggestions: suggestions ? suggestions : null, // Include only if Fake
        explanation: explanation ? explanation : null, // Include if Fake or Likely Authentic
      },
    };
  } catch (error) {
    console.error("Error:", error);
  }
}
