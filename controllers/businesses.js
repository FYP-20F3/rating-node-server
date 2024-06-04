import Business from "../models/Business.js";
import {
  countBusinessReviews,
  countBusinessRatingReviews,
} from "../controllers/reviews.js";
import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";

/* READ */
export const searchAndFilter = async (req, res) => {
  try {
    const { searchName, category, location, rating, sort } = req.query;

    // Construct the query object with dynamic filters
    let queryObj = {};

    if (searchName) {
      // Replace %20 with actual spaces
      const searchString = searchName.replace(/%20/g, " ");
      console.log(searchString);

      // Create a regex pattern to match any two characters, ignoring case
      const searchRegex = new RegExp(searchString, "i");

      // Construct the query to search for businessName matching the regex pattern
      queryObj.businessName = searchRegex;
    }

    if (category) {
      if (category === "all") {
        queryObj.businessCategory = { $ne: "all" };
      } else {
        queryObj.businessCategory = category;
      }
    }

    if (location) {
      if (location === "All") {
        queryObj.location = { $ne: "All" };
      } else {
        queryObj.location = location;
      }
    }

    if (rating) {
      // Assuming rating is a numeric value and you want businesses with a rating greater or equal
      queryObj.overallRating = { $gte: Number(rating) };
    }

    // Use the query object in the find method
    const allBusinesses = await Business.find(
      queryObj,
      { password: 0 } // Exclude the 'password' field
    );

    const businessesWithReviewCount = await Promise.all(
      allBusinesses.map(async (business) => {
        // Fetch reviews for the current business from the Review collection
        const reviews = await Review.find({ businessId: business._id });

        // Clone the business object to avoid mutating the original document
        const businessObject = business.toObject();

        // Calculate the review count
        businessObject.reviewCount = await countBusinessReviews(business.id);
        console.log(businessObject.reviewCount);

        return businessObject;
      })
    );

    // Check if the 'sort' parameter exists in the query
    if (sort) {
      if (sort === "reviewCount") {
        // Sort businesses by reviewCount in descending order
        businessesWithReviewCount.sort((a, b) => b.reviewCount - a.reviewCount);
      } else if (sort === "recentReviews") {
        // Sort businesses by the date of the most recent review in descending order
        businessesWithReviewCount.sort((a, b) => {
          const latestReviewDateA = getLatestReviewDate(a.reviews);
          const latestReviewDateB = getLatestReviewDate(b.reviews);
          return latestReviewDateB - latestReviewDateA;
        });
      } else if (sort === "none") {
        // Return businesses without any sorting
        // res.status(200).json(businessesWithReviewCount);
        // return;
      }
    }
    console;

    res.status(200).json(businessesWithReviewCount);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Helper function to get the date of the latest review for a business
const getLatestReviewDate = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return new Date(0); // Return a very old date if there are no reviews
  }
  // Find the latest review date
  return new Date(Math.max(...reviews.map((review) => new Date(review.date))));
};

export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find(
      {},
      { password: 0, businessDescription: 0, __v: 0 }
    );
    res.status(200).json(businesses);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBusinessInfoById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findOne(
      { _id: businessId },
      { password: 0 } // Exclude the 'password' field
    );

    const reviews = await Review.find({ businessId });

    const populatedReviews = [];
    const reviewTypeCounts = {
      productReviews: 0,
      deliveryReviews: 0,
      packagingReviews: 0,
      serviceReviews: 0,
    }; // Initialize review type counts object

    for (const review of reviews) {
      const customer = await Customer.findOne({ _id: review.customerId });
      const reviewObject = review.toObject();
      reviewObject.customer = customer;
      populatedReviews.push(reviewObject);

      // Increment review type counts based on review type
      switch (review.reviewType) {
        case "product":
          reviewTypeCounts.productReviews++;
          break;
        case "delivery":
          reviewTypeCounts.deliveryReviews++;
          break;
        case "packaging":
          reviewTypeCounts.packagingReviews++;
          break;
        case "service":
          reviewTypeCounts.serviceReviews++;
          break;
        default:
          break;
      }
    }

    const reviewCount = await countBusinessReviews(business.id);

    // Create an array to store rating percentages
    const ratingPercentages = [];

    // Iterate over ratings from 5 to 1
    for (let rating = 5; rating >= 1; rating--) {
      const ratingReviewCount = await countBusinessRatingReviews(
        businessId,
        rating
      );
      let percentage = ((ratingReviewCount / reviewCount) * 100).toFixed(1); // Round to one decimal place
      if (percentage === "NaN") percentage = 0;
      // Construct object with rating and percentage
      ratingPercentages.push({ rating, percentage });
    }

    const businessObject = business.toObject();
    businessObject.reviewCount = reviewCount;
    businessObject.ratingPercentages = ratingPercentages;
    businessObject.reviewTypeCounts = reviewTypeCounts; // Add review type counts to the response

    res.status(200).json(businessObject);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Controller function to block or unblock a business
export const toggleBlockBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { action } = req.body;

    // Check if businessId and action are provided
    if (!businessId || !action) {
      return res
        .status(400)
        .json({ msg: "Business ID and action are required" });
    }

    // Find the business by ID
    const business = await Business.findById(businessId);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Perform the requested action
    if (action === "block") {
      // Block the business and set blockTimeStamp
      await Business.findByIdAndUpdate(businessId, {
        block: true,
        blockTimeStamp: new Date(),
      });
      res.status(200).json({
        msg: `Business ${business.businessName} blocked successfully`,
      });
    } else if (action === "unblock") {
      // Unblock the business and set random blockTimeStamp
      const randomTimestamp = new Date(
        Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ); // Random date within 7 days
      await Business.findByIdAndUpdate(businessId, {
        block: false,
        blockTimeStamp: randomTimestamp,
      });
      res.status(200).json({
        msg: `Business ${business.businessName} unblocked successfully`,
      });
    } else {
      return res.status(400).json({ msg: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Check if businessId is provided
    if (!businessId) {
      return res.status(400).json({ msg: "Business ID is required" });
    }

    // Find and delete the business by ID
    const deletedBusiness = await Business.findByIdAndDelete(businessId);

    // Check if business exists
    if (!deletedBusiness) {
      return res.status(404).json({ msg: "Business not found" });
    }

    res.status(200).json({
      msg: `Business ${deletedBusiness.businessName} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Controller to edit business information
export const editBusinessInfo = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { businessName, password, businessDescription, location, file } =
      req.body; // Extracting data from the request body

    // Check if businessId is provided
    if (!businessId) {
      return res.status(201).json({ msg: "Business ID is required" });
    }

    // Find the business by ID
    let business = await Business.findById(businessId);

    // Check if business exists
    if (!business) {
      return res.status(201).json({ msg: "Business not found" });
    }

    // Check if the new password is provided and it's different from the old password
    if (password) {
      const isSamePassword = await bcrypt.compare(password, business.password);
      if (isSamePassword) {
        return res.status(201).json({
          msg: "The new password cannot be the same as the old password",
        });
      }
      // Hash the new password before saving
      const salt = await bcrypt.genSalt();

      business.password = await bcrypt.hash(password, salt);
    }

    // Update business information
    if (businessName && businessName != business.businessName) {
      business.businessName = businessName;
    }
    if (
      businessDescription &&
      businessDescription != business.businessDescription
    ) {
      business.businessDescription = businessDescription;
    }
    if (location && location != business.location) {
      business.location = location;
    }

    // Check if file (image) is provided
    // if (file) {
    //   // Upload image to Cloudinary
    //   const uploadResult = await cloudinary.uploader.upload(file, { folder: 'business-logos' });
    //   // Update business logo path with the secure URL from Cloudinary
    //   // console.log(uploadResult);
    //   business.businessLogoPath = uploadResult.secure_url;
    // }

    // Save the updated business info
    await business.save();

    res.status(200).json({ msg: "Business info updated successfully" });
  } catch (error) {
    console.error("Error updating business information:", error);
    res.status(500).json({ error: error.message });
  }
};

// export const getBusinessesByLocation = async (req, res) => {
//   try {
//     const { location } = req.params;
//     const business = await Business.find(
//       { location: location },
//       { password: 0 } // Exclude the 'password' field
//     );

//     res.status(200).json({ business });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

// export const getBusinessesByCategory = async (req, res) => {
//   try {
//     const { categoryName } = req.params;
//     const businessList = await Business.find(
//       { businessCategory: categoryName },
//       { password: 0 } // Exclude the 'password' field
//     );
//     const businessesWithReviewCount = await Promise.all(
//       businessList.map(async (business) => {
//         // Clone the business object to avoid mutating the original document
//         const businessObject = business.toObject();
//         businessObject.reviewCount = await countBusinessReviews(business.id);
//         return businessObject;
//     })
//     );
//     res.status(200).json(businessesWithReviewCount);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };
