import express from "express";
import { getAllData, editAdmin, getAdmin } from "../controllers/admin.js";

const router = express.Router();

/* READ */
router.get("/data", getAllData);
router.post("/edit/:adminId", editAdmin);
router.get("/:adminId", getAdmin);

export default router;
