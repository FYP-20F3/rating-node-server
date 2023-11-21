import Business from "../models/Business.js";

/* READ */
export const getAllBusinesses = async (req, res)=>{
    try {
        // const {id} = req.params;
        const allBusinesses = await Business.find();
        res.status(200).json(allBusinesses);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};