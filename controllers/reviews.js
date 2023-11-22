import Review from "../models/Review.js";
import Business from "../models/Business.js";

/* CREATE */
export const createReview = async (req, res)=>{
    try {
        let { businessId, reviewSource, reviewRating, reviewType, reviewTitle, reviewDescription,Sentiment, reviewClassificationId } = req.body;

        const business = await Business.findOne({businessName: businessId});

        const newReview = new Review({
            customerId: req.customer.id, 
            businessId: business.id, 
            reviewSource, 
            reviewRating, 
            reviewType, 
            reviewTitle, 
            reviewDescription,
            Sentiment, 
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
        const id = req.params.customerId;
        const reviews = await Review.find({customerId: id});
        res.status(200).json(reviews);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

export const getBusinessReviews = async(req, res)=>{
    try {
        const id = req.params.businessId;
        const reviews = await Review.find({businessId: id});
        res.status(200).json(reviews);
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

