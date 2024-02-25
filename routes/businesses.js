import express from "express";
import {
  getAllBusinesses,
  getBusinessesByCategory,
  getBusinessesByName
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
router.get("/business/:businessName", getBusinessesByName);
router.get("/category/:categoryName", getBusinessesByCategory);

export default router;
