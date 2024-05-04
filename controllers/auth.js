import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Business from "../models/Business.js";
import Admin from "../models/Admin.js";

/* REGISTER CUSTOMER */
export const registerCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newCustomer = new Customer({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbyWPR_XEwFflTnPQw8tNkj2_-8491kECbLpcjpKm3Zw&s",
    });
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const addCategory = async(req, res)=>{
//     try {
//         const{
//             businessCategoryName,
//         } = req.body;
//         const newCategory = new BusinessCategory({
//             businessCategoryName
//         })
//         const savedCategory = await newCategory.save();
//         res.status(201).json(savedCategory);
//     } catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }

/* REGISTER BUSINESS */
export const registerBusiness = async (req, res) => {
  try {
    const {
      businessName,
      websiteAddress,
      businessCategory,
      email,
      password,
      businessLogoPath,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // const businessCategory = await BusinessCategory.findOne({
    //   businessCategoryName: businessCategoryId,
    // });
    // if (!businessCategory) {
    //   return res
    //     .status(404)
    //     .json({ msg: "Given Business Category Not Found!" });
    // }

    const newBusiness = new Business({
      businessName,
      email,
      password: passwordHash,
      businessCategory,
      businessLogoPath:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbyWPR_XEwFflTnPQw8tNkj2_-8491kECbLpcjpKm3Zw&s",
      websiteAddress,
      location: "none",
      overallRating: 5,
    });
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* LOGGING IN */
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    let customer = await Customer.findOne({ email: email });

    // Check if customer exists
    if (!customer)
      return res.status(400).json({ msg: "Customer does not exist" });

    // Check if customer is blocked
    if (customer.block) {
      const blockTimestamp = customer.blockTimeStamp;
      const now = new Date();

      // Check if blockTimestamp exists before accessing getTime()
      if (blockTimestamp && blockTimestamp.getTime()) {
        const sevenDaysLater = new Date(
          blockTimestamp.getTime() + 7 * 24 * 60 * 60 * 1000
        ); // 7 days later

        // If seven days have passed, unblock the customer
        if (now >= sevenDaysLater) {
          await Customer.updateOne(
            { _id: customer._id },
            { $set: { block: false } }
          );
        } else {
          // Return the date when the customer can try again after the seven-day period
          return res.status(403).json({
            msg: `You are blocked. Check again after seven days ${sevenDaysLater}`,
          });
        }
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    // Generate JWT token
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = customer._doc;
    const role = "customer";

    console.log(`Logged In as Customer: ${customer.firstName}`);
    res.status(200).json({ token, rest, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;
    const business = await Business.findOne({ email });

    // Check if business exists
    if (!business)
      return res.status(400).json({ msg: "Business does not exist" });

    // Check if business is blocked
    if (business.block) {
      const blockTimestamp = business.blockTimeStamp;
      const now = new Date();

      // Check if blockTimestamp exists before accessing getTime()
      if (blockTimestamp && blockTimestamp.getTime()) {
        const sevenDaysLater = new Date(
          blockTimestamp.getTime() + 7 * 24 * 60 * 60 * 1000
        ); // 7 days later

        // If seven days have passed, unblock the business
        if (now >= sevenDaysLater) {
          await Business.updateOne(
            { _id: business._id },
            { $set: { block: false, blockTimestamp: null } }
          );
        } else {
          // Return the date when the business can try again after the seven-day period
          return res.status(403).json({
            msg: `You are blocked. Check again after seven days ${sevenDaysLater}`,
          });
        }
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    // Generate JWT token
    const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = business._doc;
    const role = "business";

    console.log(`Logged-In as Business: ${business.businessName}`);

    res.status(200).json({ token, rest, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Admin does not exist" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = admin._doc;
    const role = "admin";

    console.log(`Logged-In as Admin: ${admin.firstName}`);

    res.status(200).json({ token, rest, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbyWPR_XEwFflTnPQw8tNkj2_-8491kECbLpcjpKm3Zw&s",
    });
    await newAdmin.save();
    res.status(201).json({ result: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
