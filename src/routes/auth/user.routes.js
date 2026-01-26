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
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur et envoie un code OTP par email pour validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123"
 *                 description: "Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
 *               firstname:
 *                 type: string
 *                 example: "Jean"
 *               lastname:
 *                 type: string
 *                 example: "Dupont"
 *               avatarUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Inscription réussie, code OTP envoyé par email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Inscription éffectué avec succes"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       429:
 *         description: Trop de tentatives, réessayez plus tard
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", authLimiter, asyncHandler(UserController.register));

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Connexion utilisateur
 *     description: Authentifie un utilisateur et retourne un JWT accessToken. Si 2FA activé, retourne un mfaToken temporaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *       200:
 *         description: 2FA requis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 requires2FA:
 *                   type: boolean
 *                   example: true
 *                 mfaToken:
 *                   type: string
 *                   description: Token temporaire pour la vérification 2FA
 *                 message:
 *                   type: string
 *                   example: "Veuillez entrer votre code de sécurité"
 *       401:
 *         description: Identifiants invalides
 *       429:
 *         description: Trop de tentatives, réessayez plus tard
 */
router.post("/login", authLimiter, asyncHandler(UserController.login));

/**
 * @swagger
 * /verify-email:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Vérifier l'email avec un code OTP
 *     description: Valide le code OTP envoyé à l'email lors de l'inscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Votre compte a été validé avec succès."
 *       400:
 *         description: Code invalide ou expiré
 */
router.post("/verify-email", asyncHandler(OtpController.VerifyEmail));

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     tags:
 *       - Récupération de mot de passe
 *     summary: Demander un lien de réinitialisation de mot de passe
 *     description: Envoie un lien de réinitialisation par email (ne révèle pas si l'email existe)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email envoyé (sécurité par obscurité)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Le lien de réinitialisation a été envoyé par email."
 */
router.post("/forgot-password", asyncHandler(UserController.forgotPassword));

/**
 * @swagger
 * /update-password:
 *   post:
 *     tags:
 *       - Récupération de mot de passe
 *     summary: Mettre à jour le mot de passe
 *     description: Change le mot de passe après validation du token de réinitialisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Mot de passe mis a jour avec success"
 *       400:
 *         description: Données manquantes
 */
router.post("/update-password", asyncHandler(UserController.updatePassword));

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Déconnexion utilisateur
 *     description: Supprime la session et révoque les tokens
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Deconnexion réussie"
 *       500:
 *         description: Erreur lors de la déconnexion
 */
router.get("/logout", AuthMiddleware.isAuth, asyncHandler(UserController.logout));

/**
 * @swagger
 * /updateProfile:
 *   post:
 *     tags:
 *       - Profil Utilisateur
 *     summary: Mettre à jour le profil utilisateur
 *     description: Modifie les informations du profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: "Jean"
 *               lastname:
 *                 type: string
 *                 example: "Dupont"
 *               avatarUrl:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Profile mis a jour avec success"
 *       401:
 *         description: Non authentifié
 */
router.post("/updateProfile", AuthMiddleware.isAuth, asyncHandler(UserController.UpdateProfile));

/**
 * @swagger
 * /2fa/setup:
 *   post:
 *     tags:
 *       - Authentification à Deux Facteurs (2FA)
 *     summary: Configurer 2FA - Générer le secret QR Code
 *     description: Génère un secret TOTP et une URL QR Code pour configurer l'authentification 2FA
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Secret généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 secret:
 *                   type: string
 *                   example: "JBSWY3DPEBLW64TMMQ======"
 *                 otpauthUrl:
 *                   type: string
 *                   example: "otpauth://totp/Nexus:user@example.com?secret=JBSWY3DPEBLW64TMMQ======&issuer=Nexus"
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur lors de la génération
 */
router.post("/2fa/setup", AuthMiddleware.isAuth, asyncHandler(UserController.setup2FA));

/**
 * @swagger
 * /2fa/verify:
 *   post:
 *     tags:
 *       - Authentification à Deux Facteurs (2FA)
 *     summary: Vérifier le code 2FA
 *     description: Valide le code 2FA généré par une app authenticator (Google Authenticator, Authy, etc.)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *               mfaToken:
 *                 type: string
 *                 description: Token temporaire reçu lors du login (cas login avec 2FA)
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Code 2FA validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Authentification réussie"
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Code invalide ou expiré
 *       429:
 *         description: Trop de tentatives
 */
router.post("/2fa/verify", authLimiter, asyncHandler(OtpController.verify2FA));

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Utilisateurs
 *     summary: Récupérer tous les utilisateurs
 *     description: Retourne la liste de tous les utilisateurs du système
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Erreur serveur
 */
router.get("/", asyncHandler(UserController.getAll));

/**
 * @swagger
 * /refresh:
 *   get:
 *     tags:
 *       - Authentification
 *     summary: Rafraîchir le token d'accès
 *     description: Utilise le refresh token pour générer un nouvel access token (rotation de session)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Nouveau token généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *       401:
 *         description: Non authentifié ou session expirée
 */
router.get("/refresh", AuthMiddleware.isAuth, asyncHandler(UserController.refresh));

/**
 * @swagger
 * /{id}:
 *   get:
 *     tags:
 *       - Utilisateurs
 *     summary: Récupérer un utilisateur par ID
 *     description: Retourne les informations d'un utilisateur spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", asyncHandler(UserController.getById));

/**
 * @swagger
 * /revokeSection/{sessionId}:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Révoquer une session spécifique
 *     description: Supprime une session active de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Session supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Session spécifique supprimée avec succès"
 *       401:
 *         description: Non authentifié
 */
router.get("/revokeSection/:sessionId", AuthMiddleware.isAuth, asyncHandler(UserController.revokeSession));

/**
 * @swagger
 * /revokeAllSection/:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Révoquer toutes les sessions
 *     description: Supprime TOUTES les sessions actives de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Toutes les sessions supprimées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Toutes les sessions ont été révoquées"
 *       401:
 *         description: Non authentifié
 */
router.get("/revokeAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.revokeAllSession));

/**
 * @swagger
 * /profileUser:
 *   get:
 *     tags:
 *       - Profil Utilisateur
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     description: Retourne les informations complètes de l'utilisateur authentifié
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 */
router.get("/profileUser", AuthMiddleware.isAuth, asyncHandler(UserController.UserProfile));

/**
 * @swagger
 * /getAllSection/:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Récupérer toutes les sessions actives
 *     description: Affiche toutes les sessions actives de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sessions récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userAgent:
 *                         type: string
 *                       ipAddress:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Non authentifié
 */
router.get("/getAllSection/", AuthMiddleware.isAuth, asyncHandler(UserController.getAllSection));

/**
 * @swagger
 * /reset-password/{token}:
 *   get:
 *     tags:
 *       - Récupération de mot de passe
 *     summary: Vérifier le token de réinitialisation
 *     description: Valide le token du lien de réinitialisation reçu par email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token unique du lien de réinitialisation
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "Token valide."
 *                 email:
 *                   type: string
 *                   format: email
 *       404:
 *         description: Token invalide ou déjà utilisé
 *       410:
 *         description: Token expiré
 */
router.get("/reset-password/:token", asyncHandler(UserController.verifyResetToken));

export default router;
