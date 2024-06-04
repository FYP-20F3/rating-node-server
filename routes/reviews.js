import express from "express";
import {
  getCustomerReviews,
  getBusinessReviews,
  searchAndFilterReviews,
  createReview,
  toggleBlockReview,
  deleteReview,
  editReview,
  getSingleReview
} from "../controllers/reviews.js";
import { postReviewReply, getReviewReply } from "../controllers/reviewReply.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* CREATE */
router.post("/create", createReview);
router.post("/edit/:reviewId", editReview);

/* READ */
router.get("/customer/:customerId", getCustomerReviews);
router.get("/business/:businessId", getBusinessReviews);
router.get("/single-review/:reviewId", getSingleReview);
router.get("/searchReviews/:businessId", searchAndFilterReviews);

router.post("/replies", postReviewReply);
router.put("/:reviewId/block", toggleBlockReview);
router.delete("/:reviewId", deleteReview);
router.get("/:reviewId/replies", getReviewReply);

export default router;
