import express from "express";
import {
  searchAndFilter,
  getBusinessInfoById,
  toggleBlockBusiness,
  deleteBusiness,
  getAllBusinesses,
  // getBusinessesByCategory,
  // getBusinessesByLocation,
} from "../controllers/businesses.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/search", searchAndFilter);
router.get("/", getAllBusinesses);
router.get("/:businessId", getBusinessInfoById);
router.put("/:businessId/block", toggleBlockBusiness);
router.delete("/:businessId", deleteBusiness);
// router.get("/category/:categoryName", getBusinessesByCategory);
// router.get("/:location", getBusinessesByLocation);

export default router;
