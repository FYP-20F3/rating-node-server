import Business from "../models/Business.js";
import { countBusinessReviews } from "../controllers/reviews.js";
import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
/* READ */
export const searchAndFilter = async (req, res) => {
  try {
    // Construct the query object with dynamic filters
    let queryObj = {};

    if (req.query.searchName) {
      // Replace %20 with actual spaces
      const searchString = req.query.searchName.replace(/%20/g, " ");
      console.log(searchString);

      // Create a regex pattern to match any two characters, ignoring case
      const searchRegex = new RegExp(searchString, "i");

      // Construct the query to search for businessName matching the regex pattern
      queryObj.businessName = searchRegex;
    }

    if (req.query.category) {
      if (req.query.category === "all") {
        queryObj.businessCategory = { $ne: "all" };
      } else {
        queryObj.businessCategory = req.query.category;
      }
    }
    if (req.query.location) {
      if (req.query.location === "All") {
        queryObj.location = { $ne: "All" };
      } else {
        queryObj.location = req.query.location;
      }
    }

    if (req.query.rating) {
      // Assuming rating is a numeric value and you want businesses with a rating greater or equal
      queryObj.overallRating = { $gte: Number(req.query.rating) };
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

        // Assign the fetched reviews to the business object
        businessObject.reviews = reviews;

        // Calculate the review count
        businessObject.reviewCount = await countBusinessReviews(business.id);

        return businessObject;
      })
    );

    // Check if the 'sort' parameter exists in the query
    if (req.query.sort) {
      if (req.query.sort === "reviewCount") {
        // Sort businesses by reviewCount in descending order

        businessesWithReviewCount.sort((a, b) => b.reviewCount - a.reviewCount);
      } else if (req.query.sort === "recentReviews") {
        // Sort businesses by the date of the most recent review in descending order
        businessesWithReviewCount.sort((a, b) => {
          const latestReviewDateA = getLatestReviewDate(a.reviews);
          const latestReviewDateB = getLatestReviewDate(b.reviews);
          return latestReviewDateB - latestReviewDateA;
        });
      } else if (req.query.sort === "none") {
        // Return businesses without any sorting
        // res.status(200).json(businessesWithReviewCount);
        // return;
      }
    }

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

export const getBusinessInfoById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findOne(
      { _id: businessId },
      { password: 0 } // Exclude the 'password' field
    );

    const reviews = await Review.find({ businessId });
    const populatedReviews = [];

    for (const review of reviews) {
      const customer = await Customer.findOne({ _id: review.customerId });
      const reviewObject = review.toObject();
      reviewObject.customer = customer;
      populatedReviews.push(reviewObject);
    }

    const reviewCount = await countBusinessReviews(business.id);
    const businessObject = business.toObject();
    businessObject.reviewCount = reviewCount;
    businessObject.reviews = populatedReviews;

    res.status(200).json(businessObject);
  } catch (error) {
    res.status(404).json({ message: error.message });
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
