import { Router } from "express";
import { UserController } from "#controllers/auth/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { OtpController } from "#controllers/auth/otp.controller";
import { AuthMiddleware } from "#middlewares/auth.middleware";
import { authLimiter } from "../../config/auth.limiter.js";

const router = Router();
    /**
     * @swagger
     * /register:
     * post:
     * tags:
     * - Authentification
     * summary: Inscription d'un nouvel utilisateur
     * responses:
     * 201:
     * description: Inscription réussie
     * 400:
     * description: Données invalides
     */
    router.post("/register", authLimiter, asyncHandler(UserController.register));

    /**
     * @swagger
     * /login:
     * post:
     * tags:
     * - Authentification
     * summary: Connexion utilisateur
     * description: Authentifie un utilisateur. Peut retourner un token ou une demande de 2FA.
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * required: [email, password]
     * properties:
     * email: { type: string, format: email }
     * password: { type: string, format: password }
     * responses:
     * 200:
     * description: Succès (soit connecté, soit 2FA requis)
     * content:
     * application/json:
     * schema:
     * oneOf:
     * - $ref: '#/components/schemas/LoginSuccess'
     * - $ref: '#/components/schemas/MfaRequired'
     * 401:
     * description: Identifiants invalides
     */
    router.post("/login", authLimiter, asyncHandler(UserController.login));

    /**
     * @swagger
     * /verify-email:
     * post:
     * tags:
     * - Authentification
     * responses:
     * 200:
     * description: Email vérifié
     */
    router.post("/verify-email", asyncHandler(OtpController.VerifyEmail));

    /**
     * @swagger
     * /forgot-password:
     * post:
     * tags:
     * - Récupération de mot de passe
     * responses:
     * 200:
     * description: Email envoyé
     */
    router.post("/forgot-password", asyncHandler(UserController.forgotPassword));

    /**
     * @swagger
     * /update-password:
     * post:
     * tags:
     * - Récupération de mot de passe
     * responses:
     * 200:
     * description: Mot de passe mis à jour
     */
    router.post("/update-password", asyncHandler(UserController.updatePassword));

    /**
     * @swagger
     * /logout:
     * get:
     * tags:
     * - Authentification
     * responses:
     * 200:
     * description: Déconnexion réussie
     */
    router.get("/logout", AuthMiddleware.isAuth, asyncHandler(UserController.logout));

    /**
     * @swagger
     * /updateProfile:
     * post:
     * tags:
     * - Profil Utilisateur
     * responses:
     * 200:
     * description: Profil mis à jour
     */
    router.post("/updateProfile", AuthMiddleware.isAuth, asyncHandler(UserController.UpdateProfile));

    /**
     * @swagger
     * /2fa/setup:
     * post:
     * tags:
     * - Authentification à Deux Facteurs (2FA)
     * responses:
     * 200:
     * description: Configuration générée
     */
    router.post("/2fa/setup", AuthMiddleware.isAuth, asyncHandler(UserController.setup2FA));

    /**
     * @swagger
     * /2fa/verify:
     * post:
     * tags:
     * - Authentification à Deux Facteurs (2FA)
     * responses:
     * 200:
     * description: Code validé
     */
    router.post("/2fa/verify", authLimiter, asyncHandler(OtpController.verify2FA));

    /**
     * @swagger
     * /2fa/disable:
     * post:
     * tags:
     * - Authentification à Deux Facteurs (2FA)
     * responses:
     * 200:
     * description: 2FA désactivé
     */
    router.post("/2fa/disable", authLimiter, asyncHandler(UserController.disable));

    /**
     * @swagger
     * /:
     * get:
     * tags:
     * - Utilisateurs
     * responses:
     * 200:
     * description: Liste des utilisateurs
     */
    router.get("/", asyncHandler(UserController.getAll));

    /**
     * @swagger
     * /refresh:
     * get:
     * tags:
     * - Authentification
     * responses:
     * 200:
     * description: Token rafraîchi
     */
    router.get("/refresh", AuthMiddleware.isAuth, asyncHandler(UserController.refresh));

    /**
     * @swagger
     * /profileUser:
     * get:
     * tags:
     * - Profil Utilisateur
     * responses:
     * 200:
     * description: Profil récupéré
     */
    router.get("/profileUser", AuthMiddleware.isAuth, asyncHandler(UserController.UserProfile));

    /**
     * @swagger
     * /getAllSection/:
     * get:
     * tags:
     * - Sessions
     * responses:
     * 200:
     * description: Liste des sessions
     */
    router.get("/getAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.getAllSection));

    /**
     * @swagger
     * /revokeSection/{sessionId}:
     * get:
     * tags:
     * - Sessions
     * parameters:
     * - in: path
     * name: sessionId
     * required: true
     * schema: { type: integer }
     * responses:
     * 200:
     * description: Session révoquée
     */
    router.get("/revokeSection/:sessionId", AuthMiddleware.isAuth, asyncHandler(UserController.revokeSession));

    /**
     * @swagger
     * /revokeAllSection/:
     * get:
     * tags:
     * - Sessions
     * responses:
     * 200:
     * description: Sessions révoquées
     */
    router.get("/revokeAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.revokeAllSession));

    /**
     * @swagger
     * /reset-password/{token}:
     * get:
     * tags:
     * - Récupération de mot de passe
     * parameters:
     * - in: path
     * name: token
     * required: true
     * schema: { type: string }
     * responses:
     * 200:
     * description: Token valide
     */
    router.get("/reset-password/:token", asyncHandler(UserController.verifyResetToken));

    /**
     * @swagger
     * /{id}:
     * get:
     * tags:
     * - Utilisateurs
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema: { type: integer }
     * responses:
     * 200:
     * description: Utilisateur trouvé
     * 404:
     * description: Non trouvé
     */
    router.get("/:id", asyncHandler(UserController.getById));

    export default router;