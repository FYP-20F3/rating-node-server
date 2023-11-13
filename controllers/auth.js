import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Business from "../models/Business.js";

/* REGISTER CUSTOMER */
export const register = async(req, res)=>{
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

/* REGISTER BUSINESS */
export const registerBusiness = async(req, res)=>{
    console.log("Here in register");
    try {
        const{
            businessName,
            email,
            password,
            businessCategoryId,
            businessLogoPath,
            websiteAddress,
            locationId
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newBusiness = new Business({
            businessName,
            email,
            password: passwordHash,
            businessCategoryId,
            businessLogoPath,
            websiteAddress,
            locationId,
        })
        const savedBusiness = await newBusiness.save();
        res.status(201).json(savedBusiness);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


/* LOGGING IN */
export const login = async(req, res)=>{
    try {
        const {email, password} = req.body;
        const customer = await Customer.findOne({email: email});
        if(!customer) return res.status(400).json({msg: "Customer does not exist"});
        
        const isMatch = await bcrypt.compare(password, customer.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials. "});

        const token = jwt.sign({id: customer._id}, process.env.JWT_SECRET);
        delete customer.password;
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
        res.status(200).json({token, business});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}