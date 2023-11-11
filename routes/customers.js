import express from "express";
import {
    getCustomer,
    getUserReviews,
} from "../controllers/customers.js";
import { verifyToken } from "../middleware/auth.js";

