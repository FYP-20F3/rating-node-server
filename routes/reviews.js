import express from "express";
import {getCustomerReviews, getBusinessReviews } from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:customerId", getCustomerReviews);
router.get("/business/:businessId", getBusinessReviews);

export default router;