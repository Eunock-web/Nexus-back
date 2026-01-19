import { authenticator } from 'otplib';

export class TwoFactorService{

    /**
     * Génère un secret et l'URL pour Google Authenticator
     */
    static  generateSecret(email){
        const secretKey = authenticator.generateSecretKey();

        //Generation l'URI que le front utilisera pour generation du QRCODE
        const otpauthurl = authenticator.keyuri(
            email,
            "Nexus",
            secretKey
        )

        return {
            secretKey,
            otpauthurl
        }
    }

    /**
     * Cette fonction verifie la validiter de l'otp saisi par l'utilisateur
     */

    static VerifyOtp(token, secret) {
        return authenticator.verify({
                token,
                secret
        });
        
    }

}