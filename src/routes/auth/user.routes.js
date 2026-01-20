import { Router } from "express";
import { UserController } from "#controllers/auth/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { OtpController } from "#controllers/auth/otp.controller";
import { AuthMiddleware } from "#middlewares/auth.middleware";
const router = Router();

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register));
router.post("/login", asyncHandler(UserController.login));
router.post("/verify-email", asyncHandler(OtpController.VerifyEmail));
router.post("/forgot-password", asyncHandler(UserController.forgotPassword));
router.post("/update-password", asyncHandler(UserController.updatePassword));
router.post("/updateProfile", asyncHandler(AuthMiddleware.isAuth, UserController.UpdateProfile))


// Consultation de la liste ou d'un utilisateur
router.get("/reset-password/:token", (UserController.verifyResetToken))
router.get("/:id", asyncHandler(UserController.getById));
router.get("/revokeSection/:sessionId", asyncHandler(AuthMiddleware.isAuth, UserController.revokeSession));
router.get("/revokeAllSection/", asyncHandler(AuthMiddleware.isAuth, UserController.revokeAllSession));
router.get("/profileUser", asyncHandler(AuthMiddleware.isAuth, UserController.UserProfile));
router.get("/getAllSection/", (AuthMiddleware.isAuth, UserController.getAllSection))
router.get("/", asyncHandler(UserController.getAll));
export default router;
