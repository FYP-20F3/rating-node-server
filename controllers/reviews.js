import Business from "../models/Business.js";
import Review from "../models/Review.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReviewReply from "../models/ReviewReply.js";
import Customer from "../models/Customer.js";

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

    // gemini pro
    const reviewSentiment = await reviewSemanticAnalysis(reviewDescription);
    //console.log(reviewSentiment);

    const detectReview = await fakenessDetection(reviewDescription);
    console.log(detectReview, "detectReview");
    if (detectReview.semantics !== "Authentic") {
      return res.status(300).json({
        semantics: detectReview.semantics,
        suggestions: detectReview.details.suggestions,
      });
    }

    const newReview = new Review({
      customerId,
      businessId,
      reviewRating,
      reviewType,
      reviewTitle,
      reviewDescription,
      dateOfExperience,
      Sentiment: reviewSentiment,
    });

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
      res
        .status(200)
        .json({
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

    const prompt = `Please analyze the following review and provide a one-word judgment: 'Authentic' if it is genuine or 'Fake' if it is not.\n\nReview:"${reviewDescription}"\n\nIf the review is determined to be fake, then provide suggestions to make it more genuine with the heading "Suggestions".\n. Consider it genuine if it meets two or three of the following conditions:\nDetailed description of personal experience.\nMention of specific features or aspects of the product/service.\nUse of language consistent with genuine opinions.`;

    const authenticExample = `Output for 'Authentic' Review:\nAuthentic\nExplanation:\n1. [Explanation 1]\n2. [Explanation 2]\n`;
    const fakeExample = `Output for 'Fake' Review:\nFake\nSuggestions:\n1. [Suggestion 1]\n2. [Suggestion 2]\n3. [Suggestion 3]\n`;

    const promptText = prompt + "\n" + authenticExample + "\n" + fakeExample;
    // console.log(promptText);

    const result = await model.generateContent(promptText);
    const content = result.response.text();
    console.log(content, "content");

    // **Improved parsing and conditional handling**
    const lines = content.split("\n");
    const verdictLine = lines[0].trim(); // Get the verdict line (Authentic/Fake)
    let explanation = null;
    let suggestions = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (verdictLine === "Authentic" && line.startsWith("Explanation:")) {
        // Skip the header line 'Explanation:'
        i++; // Move to the next line for the first suggestion

        while (i < lines.length && lines[i].trim() !== "") {
          explanation = explanation || []; // Initialize suggestions if needed (only for Fake)
          explanation.push(lines[i].trim()); // Extract suggestions
          i++; // Move to the next line for the next potential suggestion
        }
      } else if (verdictLine === "Fake" && line.startsWith("Suggestions:")) {
        // Skip the header line 'Suggestions:'
        i++; // Move to the next line for the first suggestion

        while (i < lines.length && lines[i].trim() !== "") {
          suggestions = suggestions || []; // Initialize suggestions if needed (only for Fake)
          suggestions.push(lines[i].trim()); // Extract suggestions
          i++; // Move to the next line for the next potential suggestion
        }
      }
    }

    // console.log("Verdict:", verdictLine);
    // console.log("Explanation:", explanation);
    // console.log("Suggestions:", suggestions);

    // **Return the response as an object with conditional properties**
    return {
      semantics: verdictLine,
      details: {
        explanation: explanation ? explanation : null, // Include only if Authentic
        suggestions: suggestions ? suggestions : null, // Include only if Fake
      },
    };
  } catch (error) {
    console.error("Error:", error);
  }
}
