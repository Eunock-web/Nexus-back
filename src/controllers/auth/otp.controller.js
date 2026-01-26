import { validateData } from "#lib/validate";
import { OtpSchema } from "#schemas/auth/otp.schema";
import { TwoFASchema } from "#schemas/auth/TwoFa.schema";
import { OtpService } from "#services/auth/otp.service";
import { TwoFactorService } from "#services/auth/TwoFA.service";


export class OtpController{

    static async VerifyEmail(req, res){
        try{
            const validatedData = validateData(OtpSchema, req.body);
            console.log(validatedData)
            const email = String(validatedData.email)
            const code = String(validatedData.code) 

            const result = await OtpService.VerifyEmail(email, code);
            if(result.success == true){
                return res.json({
                    success : true,
                    message: "Votre compte a été validé avec succès."
                })
            }
        }catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                error : error.name,
                message: error.message || "Erreur de validation"
            });
         }
    }

    //Fonction pour la verification du code envoyer par l'utilisateur pour valider sa 2FA
    static async verify2FA(req, res) {
        try {
            const validatedData = validateData(TwoFASchema, req.body)
            const { code, mfaToken } = validatedData;
            let userId;

            // Déterminer l'identité de l'utilisateur
            if (mfaToken) {
                // Cas du Login : On décode le token temporaire
                const payload = await verifyToken(mfaToken); 
                userId = payload.sub;
            } else {
                // Cas de l'activation (User déjà connecté)
                userId = req.user.id;
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });

            // Vérification du code avec le service
            const isValid = TwoFactorService.verifyOtp(code, user.twoFactorSecret);

            if (!isValid) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Code de vérification invalide ou expiré." 
                });
            }

            // Si c'est une première activation, on valide le statut
            if (!user.twoFactorEnable) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { twoFactorEnable: true }
                });
            }

            // Génération des tokens finaux (Refresh + Access)
            // Utilise ta logique habituelle de création de session ici
            const accessToken = await signToken({ sub: userId, isFullAuth: true }, '15m');
            const refreshToken = await signToken({ sub: userId }, '7d');

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', 
                    sameSite: 'Strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
                });

            return res.json({
                success: true,
                message: "Authentification réussie",
                accessToken : accessToken,
            });

        } catch (error) {
            return res.status(401).json({ success: false, message: "Session expirée" });
        }
    }

}