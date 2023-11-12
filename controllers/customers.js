import Customer from "../models/Customer.js";

/* READ */
export const getCustomer = async (req, res)=>{
    try {
        const {id} = req.params;
        const customer = await Customer.findById(id);
        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

// export const getCustomerReviews = async(req, res)=>{
//     try{
//     const { id } = req.params;
//     const customer = await Customer.findById(id);

//     const reviews = await Promise.all(
//         customer.reviews.map((id) => Customer.findById(id))
//     )
//     const formattedReviews = reviews.map(
//         ({_id, firstName, lastName, picturePath})=>{
//             return {_id, firstName, lastName, occupation, location, picturePath};
//         }
//     );
//     res.status(200).json(formattedReviews);}
//     catch(error){
//         res.status(404).json({message: error.message});
//     }
// };


