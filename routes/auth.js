import express from "express";
import { loginCustomer, loginBusiness, registerCustomer, registerBusiness } from "../controllers/auth.js";
// import {loginCustomer, loginBusiness, addCategory} from "../controllers/auth.js";

const router = express.Router();

router.post("/login/customer", loginCustomer);
router.post("/login/business", loginBusiness);
router.post("/register/customer", registerCustomer);
router.post("/register/business", registerBusiness);
// router.post("/addcategory", addCategory);

export default router;
