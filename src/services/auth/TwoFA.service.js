import { TOTP } from 'otplib';

export class TwoFactorService {
    /**
     * Génère un secret et l'URL pour Google Authenticator
     */
    static generateSecretKey(email) {
        // .generateSecret() est la méthode correcte
        const secret = TOTP.generateSecret(); 

        const otpauthUrl = TOTP.keyuri(
            email,
            "Nexus",
            secret
        );

        return {
            secret,
            otpauthUrl
        };
    }

    /**
     * Vérifie la validité de l'otp saisi par l'utilisateur
     */
    static verifyOtp(token, secret) {
        try {
            return TOTP.verify({
                token,
                secret
            });
        } catch (err) {
            return false;
        }
    }
}