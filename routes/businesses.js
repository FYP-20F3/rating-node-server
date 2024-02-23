import express from "express";
import {
    getAllBusinesses,
    getBusinessCategory,
    getBusinessByCategory
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
router.get("/category",verifyToken, getBusinessCategory);
router.get("/:categoryName",verifyToken, getBusinessByCategory);

export default router;