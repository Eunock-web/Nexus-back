import { jwtVerify } from "jose";


export class AuthMiddleware{
    static async isAuth(req, res, next){
        // Récupération du token depuis le header Authorization ou le cookie
        let token = req.cookies.refreshToken;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if(!token){
            return res.status(401).json({ message: "Accès refusé. Token manquant." });
        }

        try{
            // Encodage de la cle secrete pour la verification du payload
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);

            // Verification du token
            const {payload} = await jwtVerify(token, secret);

            // Sécurité supplémentaire : Vérifier si c'est un token MFA temporaire
            if (payload.type === 'mfa') {
                return res.status(403).json({ message: "Veuillez valider l'étape 2FA." });
            }

            // Injecter les infos de l'utilisateur dans 'req' pour les routes suivantes
            req.user = {
                id: payload.sub,
                // email: payload.email
            };

            next(); 
        }catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }
    }

}