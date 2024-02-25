import express from "express";
import {
  getAllBusinesses,
  getBusinessesByCategory,
  getBusinessesByName,
  getBusinessesByLocation
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
router.get("/business/:businessName", getBusinessesByName);
router.get("/category/:categoryName", getBusinessesByCategory);
router.get("/:location", getBusinessesByLocation);

export default router;
