import express from "express";
import {
  getCustomer,
  toggleBlockCustomer,
  deleteCustomer,
  getAllCustomers
} from "../controllers/customers.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllCustomers);
router.get("/:id", verifyToken, getCustomer);
router.put("/:customerId/block", toggleBlockCustomer);
router.delete("/:customerId", deleteCustomer);

export default router;
