import express from "express";
import {
  searchAndFilter,
  getBusinessInfoById,
  // getBusinessesByCategory,
  // getBusinessesByLocation,
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/search", searchAndFilter);
router.get("/:businessId", getBusinessInfoById);
// router.get("/category/:categoryName", getBusinessesByCategory);
// router.get("/:location", getBusinessesByLocation);

export default router;
