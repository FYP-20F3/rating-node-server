import express from "express";
import {login, loginBusiness} from "../controllers/auth.js";

const router = express.Router();

router.post("customer/login", login);
router.post("/business/login", loginBusiness);

export default router;