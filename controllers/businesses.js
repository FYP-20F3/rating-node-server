import Business from "../models/Business.js";
import {countBusinessReviews} from "../controllers/reviews.js";
/* READ */
export const getAllBusinesses = async (req, res) => {
  try {
    const allBusinesses = await Business.find();
    console.log("Hello Businesses!");
    res.status(200).json(allBusinesses);
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

export const getBusinessesByCategory = async (req, res) => {
  console.log("Hello Category!");
  try {
    const { categoryName } = req.params;
    const businessList = await Business.find(
      { businessCategory: categoryName },
      { password: 0 } // Exclude the 'password' field
    );
    res.status(200).json({ businessList });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
