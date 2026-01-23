import express from 'express';
import { OAuthController } from '#controllers/OAuth/auth.controller';
import { asyncHandler } from '#lib/async-handler';

const oauthRouter = express.Router();

/**
 * Routes OAuth
 */

// Route pour rediriger vers Google
oauthRouter.get('/auth/google/redirect', asyncHandler(OAuthController.redirect));

// Route callback pour Google (appelée par Google après authentification)
oauthRouter.get('/auth/google/callback', asyncHandler(OAuthController.callback));

export default oauthRouter;
