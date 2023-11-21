import mongoose from "mongoose";

const BusinessCategorySchema = new mongoose.Schema({
    businessCategoryName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
}, {timestamps: true})

const BusinessCategory = mongoose.model("BusinessCategory", BusinessCategorySchema);
export default BusinessCategory;