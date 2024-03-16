import Business from "../models/Business.js";
import { countBusinessReviews } from "../controllers/reviews.js";
/* READ */
export const searchAndFilter = async (req, res) => {
  try {
    // Construct the query object with dynamic filters
    let queryObj = {};

    if (req.query.category) {
      queryObj.businessCategory = req.query.category;
    }

    if (req.query.location) {
      queryObj.location = req.query.location;
    }

    if (req.query.name) {
      queryObj.businessName = req.query.name;
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
        // Clone the business object to avoid mutating the original document
        const businessObject = business.toObject();
        businessObject.reviewCount = await countBusinessReviews(business.id);
        return businessObject;
      })
    );

    // Sort businesses by reviewCount in descending order
    businessesWithReviewCount.sort((a, b) => b.reviewCount - a.reviewCount);

    res.status(200).json(businessesWithReviewCount);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBusinessesByName = async (req, res) => {
  try {
    const { businessName } = req.params;
    const business = await Business.findOne(
      { businessName: businessName },
      { password: 0 } // Exclude the 'password' field
    );

    const reviewCount = await countBusinessReviews(business.id);

    res.status(200).json({ business, reviewCount });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBusinessesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const business = await Business.find(
      { location: location },
      { password: 0 } // Exclude the 'password' field
    );

    res.status(200).json({ business });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBusinessesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const businessList = await Business.find(
      { businessCategory: categoryName },
      { password: 0 } // Exclude the 'password' field
    );
    const businessesWithReviewCount = await Promise.all(
      businessList.map(async (business) => {
        // Clone the business object to avoid mutating the original document
        const businessObject = business.toObject();
        businessObject.reviewCount = await countBusinessReviews(business.id);
        return businessObject;
      })
    );
    res.status(200).json(businessesWithReviewCount);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
