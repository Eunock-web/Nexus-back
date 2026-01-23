import express from 'express';
import { OAuthController } from '#controllers/OAuth/auth.controller';
import { asyncHandler } from '#lib/async-handler';

const oauthRouter = express.Router();

/**
 * @swagger
 * /auth/google/redirect:
 *   get:
 *     tags:
 *       - OAuth - Google
 *     summary: Rediriger vers Google OAuth
 *     description: Redirige l'utilisateur vers la page de connexion Google pour l'authentification OAuth 2.0
 *     responses:
 *       302:
 *         description: Redirection vers Google OAuth consent screen
 *       500:
 *         description: Erreur lors de la génération du lien d'authentification
 */
oauthRouter.get('/auth/google/redirect', asyncHandler(OAuthController.redirect));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - OAuth - Google
 *     summary: Callback Google OAuth
 *     description: Point de terminaison de rappel utilisé par Google pour renvoyer le code d'autorisation. Cette route traite le code et crée ou met à jour l'utilisateur en base de données.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code d'autorisation reçu de Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: État CSRF pour valider la requête
 *     responses:
 *       200:
 *         description: Authentification réussie, tokens retournés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   description: JWT Access Token valide 15 minutes
 *                 refreshToken:
 *                   type: string
 *                   description: JWT Refresh Token valide 7 jours
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Code invalide ou manquant
 *       500:
 *         description: Erreur lors du traitement du callback
 */
oauthRouter.get('/auth/google/callback', asyncHandler(OAuthController.callback));


/**
 * @swagger
 * /auth/github/redirect:
 *   get:
 *     tags:
 *       - OAuth - GitHub
 *     summary: Rediriger vers GitHub OAuth
 *     description: Redirige l'utilisateur vers la page de connexion GitHub pour l'authentification OAuth 2.0. Permet le register et le login avec GitHub
 *     responses:
 *       302:
 *         description: Redirection vers GitHub OAuth authorization screen
 *       500:
 *         description: Erreur lors de la génération du lien d'authentification
 */
oauthRouter.get('/auth/github/redirect', asyncHandler(OAuthController.githubRedirect));

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     tags:
 *       - OAuth - GitHub
 *     summary: Callback GitHub OAuth
 *     description: Point de terminaison de rappel utilisé par GitHub pour renvoyer le code d'autorisation. Cette route traite le code, crée ou met à jour l'utilisateur en base de données, et retourne les tokens JWT.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code d'autorisation reçu de GitHub
 *     responses:
 *       200:
 *         description: Authentification réussie via GitHub, tokens retournés
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
 *                   example: "Authentification réussie via GitHub"
 *                 accessToken:
 *                   type: string
 *                   description: JWT Access Token valide 15 minutes
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 refreshToken:
 *                   type: string
 *                   description: JWT Refresh Token valide 7 jours (dans les cookies)
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Code invalide ou manquant
 *       500:
 *         description: Erreur lors du traitement du callback GitHub
 */
oauthRouter.get('/auth/github/callback', asyncHandler(OAuthController.githubCallback));

export default oauthRouter;
