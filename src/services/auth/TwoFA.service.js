import { NotFoundException } from '#lib/exceptions';
import prisma from '#lib/prisma';
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

    /**
     * Fonction pour desactiver la twoFa
     */
    static async desable(userId){
        //Chercher l'utilisateur
        const user = await prisma.user.findUnique({where: {id: userId}});

        if(!user){
            throw NotFoundException("Utilisateur inexisant");
        }

        //Changer les champs de la 2FA dans la table user
        const updateData = await prisma.user.update({
            where : {id : user.id},
            data : {
                twoFactorEnable : false,
                twoFactorSecret : ""
            }
        })

        return {
            success : true,
        }
    }
}