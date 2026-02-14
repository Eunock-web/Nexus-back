import { UserDto } from "#dto/user.dto";
import prisma from "#lib/prisma";
import { OAuthService } from "#services/OAuth/auth.service";

export class OAuthController {
    static async redirect(req, res){
        const googleAuthUrl = await OAuthService.refirectToGoogle();
        res.redirect(googleAuthUrl);
    };

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
        res.cookie('refreshToken', result.response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        const user = await prisma.user.findUnique({where : {email : result.data}});

        return res.status(200).json({
            success: true,
            message: "Authentification réussie",
            accessToken: result.response.accessToken,
            user : UserDto.transform(user)
        });
    };


    /**
     * Redirection vers GitHub OAuth
     * GET /auth/github/redirect
     */
    static async githubRedirect(req, res) {
        try {
            const githubAuthUrl = await OAuthService.redirectToGithub();
            res.redirect(githubAuthUrl);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la redirection vers GitHub"
            });
        }
    }

    /**
     * Callback après authentification GitHub
     * GET /auth/github/callback?code=...
     */
    static async githubCallback(req, res) {
        try {
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

            // Traiter l'authentification GitHub
            const result = await OAuthService.handleGithubAuth(code, meta);

            // Envoyer les tokens (accessToken dans le body, refreshToken en cookie)
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            const user = await prisma.user.findUnique({where : {email : result.data}});

            return res.status(200).json({
                success: true,
                message: "Authentification réussie via GitHub",
                accessToken: result.response.accessToken,
                refreshToken: result.response.refreshToken,
                user: UserDto.transform(user)
            });

        } catch (error) {
            console.error('Erreur GitHub callback:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de l'authentification GitHub"
            });
        }
    }
}