import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Business from "../models/Business.js";
import BusinessCategory from "../models/BusinessCategory.js";

/* REGISTER CUSTOMER */
export const registerCustomer = async(req, res)=>{
    try {
        const{
            firstName,
            lastName,
            email,
            password,
            picturePath
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newCustomer = new Customer({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath
        })
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

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
export const registerBusiness = async(req, res)=>{
    try {
        const{
            businessName,
            email,
            password,
            businessCategory,
            businessLogoPath,
            websiteAddress,
            location,
            overallRating
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        
        // const businessCategory = await BusinessCategory.findOne({businessCategoryName: businessCategoryId});
        // if(!businessCategory){
        //     return res.status(404).json({msg: "Given Business Category Not Found!"});
        // }


        const newBusiness = new Business({
            businessName,
            email,
            password: passwordHash,
            businessCategory,
            businessLogoPath,
            websiteAddress,
            location,
            overallRating
        })
        const savedBusiness = await newBusiness.save();
        res.status(201).json(savedBusiness);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


/* LOGGING IN */
export const loginCustomer = async(req, res)=>{
    try {
        const {email, password} = req.body;
        const customer = await Customer.findOne({email: email});
        if(!customer) return res.status(400).json({msg: "Customer does not exist"});
        
        const isMatch = await bcrypt.compare(password, customer.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials. "});

        const token = jwt.sign({id: customer._id}, process.env.JWT_SECRET);
        delete customer.password;
        console.log(`Logged In as Customer: ${customer.firstName}`);
        res.status(200).json({token, customer});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const loginBusiness = async(req, res)=>{
    try {
        const {email, password} = req.body;
        const business = await Business.findOne({email: email});
        if(!business) return res.status(400).json({msg: "Business does not exist"});
        
        const isMatch = await bcrypt.compare(password, business.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials. "});

        const token = jwt.sign({id: business._id}, process.env.JWT_SECRET);
        delete business.password;
        console.log(`Logged-In as Business: ${business.businessName}`);
        res.status(200).json({token, business});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}