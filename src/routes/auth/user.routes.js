import { Router } from "express";
import { UserController } from "#controllers/auth/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { OtpController } from "#controllers/auth/otp.controller";
import { AuthMiddleware } from "#middlewares/auth.middleware";
import { authLimiter } from "../../config/auth.limiter.js";
import { OAuthController } from "#controllers/OAuth/auth.controller";
const router = Router();

// Inscription et Connexion
router.post("/register", authLimiter, asyncHandler(UserController.register));
router.post("/login", authLimiter, asyncHandler(UserController.login));
router.post("/verify-email", asyncHandler(OtpController.VerifyEmail));
router.post("/forgot-password", asyncHandler(UserController.forgotPassword));
router.post("/update-password", asyncHandler(UserController.updatePassword));
router.post("/logout", AuthMiddleware.isAuth, asyncHandler(UserController.logout));
router.post("/updateProfile", AuthMiddleware.isAuth, asyncHandler(UserController.UpdateProfile));
router.post("/2fa/setup", AuthMiddleware.isAuth, asyncHandler(UserController.setup2FA));
router.post("/2fa/verify", authLimiter, asyncHandler(OtpController.verify2FA));

// Consultation de la liste ou d'un utilisateur
router.get("/OAuth", OAuthController);
router.get("/reset-password/:token", asyncHandler(UserController.verifyResetToken));
router.get("/", asyncHandler(UserController.getAll));
router.get("/refresh", AuthMiddleware.isAuth, asyncHandler(UserController.refresh));
router.get("/:id", asyncHandler(UserController.getById));
router.get("/revokeSection/:sessionId", AuthMiddleware.isAuth, asyncHandler(UserController.revokeSession));
router.get("/revokeAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.revokeAllSession));
router.get("/profileUser", AuthMiddleware.isAuth, asyncHandler(UserController.UserProfile));
router.get("/getAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.getAllSection));
export default router;
