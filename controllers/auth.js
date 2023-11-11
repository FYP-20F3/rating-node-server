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