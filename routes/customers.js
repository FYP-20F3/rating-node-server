import express from "express";
import {
    getCustomer
} from "../controllers/customers.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getCustomer);

export default router;