import { OAuthService } from "#services/OAuth/auth.service";

export class OAuthController {
    /**
     * Redirection vers Google OAuth
     * GET /auth/google/redirect
     */
    static async redirect(req, res){
        const googleAuthUrl = await OAuthService.refirectToGoogle();
        res.redirect(googleAuthUrl);
    };

    /**
     * Callback après authentification Google
     * GET /auth/google/callback?code=...&state=...
     */
    static async callback(req, res){
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: "Code d'authentification manquant" 
            });
        }

        // Récupérer les métadonnées de la requête
        const meta = {
            userAgent: req.get('user-agent'),
            ipAddress: req.ip
        };

        // Traiter l'authentification Google
        const result = await OAuthService.handleGoogleAuth(code, meta);

        // Envoyer les tokens (accessToken dans le body, refreshToken en cookie)
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        return res.status(200).json({
            success: true,
            message: "Authentification réussie",
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    };
}