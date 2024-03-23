import express from "express";
import {
  getCustomerReviews,
  getBusinessReviews,
  createReview,
} from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* CREATE */
router.post("/create", createReview);

/* READ */
router.get("/customer/:customerId", verifyToken, getCustomerReviews);
router.get("/business/:businessId", verifyToken, getBusinessReviews);

export default router;
