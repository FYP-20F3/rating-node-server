import express from "express";
import {
  getCustomerReviews,
  getBusinessReviews,
  searchAndFilterReviews,
  createReview,
  toggleBlockReview,
  deleteReview,
} from "../controllers/reviews.js";
import { postReviewReply, getReviewReply } from "../controllers/reviewReply.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* CREATE */
router.post("/create", createReview);

/* READ */
router.get("/customer/:customerId", getCustomerReviews);
router.get("/business/:businessId", getBusinessReviews);
router.get("/searchReviews/:businessId", searchAndFilterReviews);

router.post("/replies", postReviewReply);
router.put("/:reviewId/block", toggleBlockReview);
router.delete("/:reviewId", deleteReview);
router.get("/:reviewId/replies", getReviewReply);

export default router;
