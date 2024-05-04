import express from "express";
import { getAllData } from "../controllers/admin.js";

const router = express.Router();

/* READ */
router.get("/data", getAllData);

export default router;
