import Business from "../models/Business.js";

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

export const getBusinessesByCategory = async (req, res) => {
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
