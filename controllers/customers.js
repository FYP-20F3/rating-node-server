import Customer from "../models/Customer.js";

/* READ */
export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    res.status(200).json(customer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}, { password: 0 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const toggleBlockCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { action } = req.body;

    // Check if customerId and action are provided
    if (!customerId || !action) {
      return res
        .status(400)
        .json({ msg: "Customer ID and action are required" });
    }

    // Find the customer by ID
    const customer = await Customer.findById(customerId);

    // Check if customer exists
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    // Perform the requested action
    if (action === "block") {
      // Block the customer and set blockTimeStamp
      await Customer.findByIdAndUpdate(customerId, {
        block: true,
        blockTimeStamp: new Date(),
      });
      res.status(200).json({
        msg: `Customer ${customer.firstName} ${customer.lastName} blocked successfully`,
      });
    } else if (action === "unblock") {
      // Unblock the customer and set random blockTimeStamp
      const randomTimestamp = new Date(
        Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ); // Random date within 7 days
      await Customer.findByIdAndUpdate(customerId, {
        block: false,
        blockTimeStamp: randomTimestamp,
      });
      res.status(200).json({
        msg: `Customer ${customer.firstName} ${customer.lastName} unblocked successfully`,
      });
    } else {
      return res.status(400).json({ msg: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customerId is provided
    if (!customerId) {
      return res.status(400).json({ msg: "Customer ID is required" });
    }

    // Find and delete the customer by ID
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    // Check if customer exists
    if (!deletedCustomer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    res.status(200).json({
      msg: `Customer ${deletedCustomer.firstName} ${deletedCustomer.lastName} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
