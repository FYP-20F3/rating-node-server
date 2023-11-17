import express from "express";
import {loginCustomer, loginBusiness} from "../controllers/auth.js";

const router = express.Router();

router.post("/customer/login", loginCustomer);
router.post("/business/login", loginBusiness);

export default router;