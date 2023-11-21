import express from "express";
import {
    getAllBusinesses
} from "../controllers/businesses.js";
// import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);

export default router;