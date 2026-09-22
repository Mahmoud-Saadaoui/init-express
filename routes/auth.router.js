import express from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/auth/register", register)
router.get("/auth/login", login)

export default router;
