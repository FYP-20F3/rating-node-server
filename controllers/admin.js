import Customer from "../models/Customer.js";
import Business from "../models/Business.js";
import Review from "../models/Review.js";

export const getAllData = async (req, res) => {
  try {
    const reviews = await Review.find();
    const customers = await Customer.find();
    const businesses = await Business.find();

    res.status(200).json({ reviews, customers, businesses });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
