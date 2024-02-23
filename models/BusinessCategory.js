import mongoose from "mongoose";

const BusinessCategorySchema = new mongoose.Schema({
    
}, {timestamps: true})

const BusinessCategory = mongoose.model("BusinessCategory", BusinessCategorySchema);
export default BusinessCategory;