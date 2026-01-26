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
    static async desable(userId) {
        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException("Utilisateur inexistant");
        }

        // Vérifier si la 2FA n'est pas déjà désactivée (évite des requêtes inutiles)
        if (!user.twoFactorEnable) {
            throw new BadRequestException("La 2FA est déjà désactivée.");
        }

        // Mise à jour atomique
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnable: false,
                twoFactorSecret: null // Utilise null au lieu d'une chaîne vide si ton schéma le permet
            }
        });

        return { success: true };
    }
}