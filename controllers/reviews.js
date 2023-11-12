import Review from "../models/Review.js";

/* CREATE */
export const createReview = async (req, res)=>{
    try {
        const { customerId, businessId, reviewSource, reviewRating, reviewType, reviewTitle, reviewDescription, dateOfExperience, reviewClassificationId } = req.body;

        // const customer = await Customer.findById(customerId);
        const newReview = new Review({
            customerId, 
            businessId, 
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
        res.status(201).json(reviews);

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

