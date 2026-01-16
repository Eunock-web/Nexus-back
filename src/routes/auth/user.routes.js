import { Router } from "express";
import { UserController } from "#controllers/auth/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { OtpController } from "#controllers/auth/otp.controller";

const router = Router();

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register));
router.post("/login", asyncHandler(UserController.login));
router.post("/verify-email", asyncHandler(OtpController.VerifyEmail));

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", asyncHandler(UserController.getById));
export default router;
