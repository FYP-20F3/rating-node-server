import express from "express";
import { userChats } from "../controllers/chat.js";
const router = express.Router();

router.get("/:userId", userChats);

export default router;
