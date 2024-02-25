import express from "express";
import {
  getAllBusinesses,
  getBusinessesByCategory,
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllBusinesses);
<<<<<<< HEAD
router.get("/category",verifyToken, getBusinessCategory);
router.get("/:categoryName",verifyToken, getBusinessByCategory);
=======
router.get("/:categoryName", getBusinessesByCategory);
>>>>>>> 10cb7bf80a63b890f78445926279190f6c6d8c7f

export default router;
