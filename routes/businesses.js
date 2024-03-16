import express from "express";
import {
  searchAndFilter,
  getBusinessesByCategory,
  getBusinessesByName,
  getBusinessesByLocation,
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/search", searchAndFilter);
router.get("/business/:businessName", getBusinessesByName);
router.get("/category/:categoryName", getBusinessesByCategory);
router.get("/:location", getBusinessesByLocation);

export default router;
