import Review from "../models/Review.js";
import Business from "../models/Business.js";

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

    const newReview = new Review({
      customerId,
      businessId,
      reviewRating,
      reviewType,
      reviewTitle,
      reviewDescription,
      dateOfExperience,
    });

    await newReview.save();
    const reviews = await Review.find();
    res.status(201).json(reviews);
  } catch (error) {
    res.status(409).json({ msg: error.message });
  }
};

/* READ */
export const getCustomerReviews = async (req, res) => {
    const { keyword, rating, category, dateSort } = req.query;
    const customerId = req.params.customerId;
  
    let query = { customerId };
  
    if (keyword) {
      query.$text = { $search: keyword }; // Ensure you've set up a text index in MongoDB
    }
  
    if (rating) {
      query.rating = rating;
    }
  
    if (category) {
      query.category = category;
    }
  
    let sortOptions = {};
    if (dateSort) {
      sortOptions.createdAt = dateSort === 'new' ? -1 : 1;
    }
  
    try {
      const reviews = await Review.find(query)
                                  .populate('replies') // Assuming you want to populate replies
                                  .sort(sortOptions)
                                  .exec();
      res.json(reviews);
    } catch (error) {
      res.status(500).send(error);
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

export const countBusinessReviews = async (businessId) => {
  console.log(businessId);
  try {
    const count = await Review.countDocuments({ businessId: businessId });
    console.log(`Number of reviews for business ${businessId}: ${count}`);
    return count;
  } catch (error) {
    console.error("Error counting reviews:", error.message);
  }
};

// export const countCategoryReviews = async (category) => {
//     console.log(category);
//     try {
//       const count = await Review.countDocuments({ businessId: businessId });
//       console.log(`Number of reviews for business ${businessId}: ${count}`);
//       return count;
//     } catch (error) {
//       console.error('Error counting reviews:', error.message);
//     }
// };
