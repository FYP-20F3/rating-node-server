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
        min: 8,
        max: 50
    },
    businessCategory: {
        type: String,
        required: true,
    },
    businessLogoPath: {
        type: String,
        default: ""
    },
    websiteAddress: String,
    location: {
        type: String,
<<<<<<< HEAD
        default: "someLocation"
=======
        default: "some"
>>>>>>> 10cb7bf80a63b890f78445926279190f6c6d8c7f
    },
    overallRating: {
        type: Number,
        min: 0,
        max: 5,
    },
}, {timestamps: true})

const Business = mongoose.model("Business", BusinessSchema);
export default Business;
