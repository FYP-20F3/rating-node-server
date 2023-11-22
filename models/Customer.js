import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    lastName: {
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
    picturePath: {
        type: String,
        default: ""
    }
}, {timestamps: true})

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;
