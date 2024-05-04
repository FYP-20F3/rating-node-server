import express from "express";
import {
  loginCustomer,
  loginBusiness,
  registerCustomer,
  registerBusiness,
  registerAdmin,
  loginAdmin,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login/customer", loginCustomer);
router.post("/login/business", loginBusiness);
router.post("/login/admin", loginAdmin);
router.post("/register/customer", registerCustomer);
router.post("/register/business", registerBusiness);
router.post("/register/admin", registerAdmin);
// router.post("/addcategory", addCategory);

export default router;
