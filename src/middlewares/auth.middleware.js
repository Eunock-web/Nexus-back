import { jwtVerify } from "jose";


export class AuthMiddleware{
    static async isAuth(req, res, next){
        //Recuperation du token depuis le cookie
        const token = req.cookies.refreshToken;

        if(!token){
            return res.status(401).json({ message: "Accès refusé. Token manquant." });
        }

        try{
            //Encodage de la cle secrete pour la cerification du payload
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);

            //Verification du token
            const {payload} = await jwtVerify(token, secret);

            //Sécurité supplémentaire : Vérifier si c'est un token MFA temporaire
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
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }
    }

}