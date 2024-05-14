import express from "express";
import { setComplaintStatus } from "../controllers/complaint.js";
const router = express.Router();

router.put("/:complainId", setComplaintStatus);
export default router;
