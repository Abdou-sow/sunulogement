import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, verifyPassword, updateProfile } from "../controllers/authcontroller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-password", protect, verifyPassword);
router.put("/update-profile", protect, updateProfile);

export default router;
