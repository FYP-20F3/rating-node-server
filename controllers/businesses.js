import Business from "../models/Business.js";
import BusinessCategory from "../models/BusinessCategory.js";

/* READ */
export const getAllBusinesses = async (req, res)=>{
    try {
        const allBusinesses = await Business.find();
        console.log("Hello Businesses!");
        res.status(200).json(allBusinesses);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const getBusinessCategory = async (req, res)=>{
    try {
        const allBusinessCategories = await BusinessCategory.find();
        res.status(200).json(allBusinessCategories);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const getBusinessByCategory = async (req, res)=>{
    try {
        const {categoryName} = req.params; 
        const businessCategory = await BusinessCategory.findOne({businessCategoryName: categoryName});
        const {id} = businessCategory;
        const businesses = await Business.find({businessCategoryId: id})
        
        res.status(200).json({businesses});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};