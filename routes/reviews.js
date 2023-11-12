import express from "express";
import {getCustomerReviews } from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:customerId/reviews",verifyToken , getCustomerReviews)


export default router;