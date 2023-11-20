import Review from "../models/Review.js";
import Business from "../models/Business.js";

/* CREATE */
export const createReview = async (req, res)=>{
    try {
        let { businessId, reviewSource, reviewRating, reviewType, reviewTitle, reviewDescription, dateOfExperience, reviewClassificationId } = req.body;

        const business = await Business.findOne({businessName: businessId});

        const newReview = new Review({
            customerId: req.customer.id, 
            businessId: business._id, 
            reviewSource, 
            reviewRating, 
            reviewType, 
            reviewTitle, 
            reviewDescription, 
            dateOfExperience, 
            reviewClassificationId
        });
        await newReview.save();
        const reviews = await Review.find();
        res.status(201).json(business);

    } catch (error) {
        res.status(409).json({msg: error.message});
    }
}

/* READ */
export const getCustomerReviews = async(req, res)=>{
    try {
        const { customerId } = req.params;
        const reviews = await Review.find({customerId});
        res.status(200).json(reviews);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

