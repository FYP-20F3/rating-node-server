import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    businessCategoryId: {
        type: String,
        required: true,
    },
    businessLogoPath: {
        type: String,
        default: ""
    },
    websiteAddress: String,
    locationId: {
        type: String,
        required: true,
    },
    overallRating: {
        type: Number,
        min: 0,
        max: 5,
    },
}, {timestamps: true})

const Business = mongoose.model("Business", BusinessSchema);
export default Business;
