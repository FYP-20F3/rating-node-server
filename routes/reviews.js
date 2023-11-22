import express from "express";
import {getCustomerReviews, getBusinessReviews, createReview } from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* CREATE */
router.post("/create",verifyToken, createReview);

/* READ */
router.get("/customer/:customerId", getCustomerReviews);
router.get("/business/:businessId", getBusinessReviews);

export default router;