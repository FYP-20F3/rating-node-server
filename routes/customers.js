import express from "express";
import {
  getCustomer,
  toggleBlockCustomer,
  deleteCustomer,
  getAllCustomers,
  editCustomer,
} from "../controllers/customers.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", getAllCustomers);
router.get("/:id", getCustomer);
router.put("/:customerId/block", toggleBlockCustomer);
router.delete("/:customerId", deleteCustomer);
router.post("/edit/:customerId", editCustomer);

export default router;
