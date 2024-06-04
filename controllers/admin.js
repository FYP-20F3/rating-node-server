import Customer from "../models/Customer.js";
import Business from "../models/Business.js";
import Review from "../models/Review.js";
import Admin from "../models/Admin.js";

export const getAllData = async (req, res) => {
  try {
    const reviews = await Review.find();
    const customers = await Customer.find();
    const businesses = await Business.find();

    res.status(200).json({ reviews, customers, businesses });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export async function editAdmin(req, res) {
  const { adminId } = req.params;
  const { firstName, lastName, password } = req.body;

  // Validate request body for presence of at least one field
  if (!firstName && !lastName && !password) {
    return res.status(400).json({ msg: "No fields provided for update" });
  }

  try {
    // Find the admin to update
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(201).json({ msg: "Customer not found" });
    }

    // Create an update object with only provided fields
    const updates = {};
    if (firstName && firstName != admin.firstName)
      updates.firstName = firstName;
    if (lastName && lastName != admin.lastName) updates.lastName = lastName;
    if (password) {
      const isSamePassword = await bcrypt.compare(password, admin.password);
      if (isSamePassword) {
        return res.status(201).json({
          msg: "The new password cannot be the same as the old password",
        });
      }

      const salt = await bcrypt.genSalt();
      updates.password = await bcrypt.hash(password, salt);
    }

    // Perform update and handle potential duplicate key error
    const updatedCustomer = await Admin.findByIdAndUpdate(
      adminId,
      updates,
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedCustomer) {
      // Handle potential duplicate key error (unique email constraint)
      return res.status(201).json({ msg: "Update failed: duplicate email" });
    }

    res.status(200).json({
      msg: "Admin updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating admin" });
  }
}

export const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId);
    res.status(200).json(admin);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};