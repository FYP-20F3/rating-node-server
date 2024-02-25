import express from "express";
import {
  getAllBusinesses,
  getBusinessesByCategory,
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
router.get("/:categoryName",verifyToken, getBusinessByCategory);

export default router;
