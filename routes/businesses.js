import express from "express";
import {
    getAllBusinesses,
    getBusinessCategory
} from "../controllers/businesses.js";
// import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
router.get("/category", getBusinessCategory);

export default router;