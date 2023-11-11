import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

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