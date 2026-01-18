import prisma from "#lib/prisma";
import nodemailer from 'nodemailer'
import { generateOtp } from "#lib/otp";
import { otpTemplate } from "../../templates/otp-email.js";
import crypto from 'crypto';

export class OtpService{
    
    //Fonction de configuration de NodeMailer
    static transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, 
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    //Fonction de sauvegarde du code 
    static async SaveOtp(email){
        const codeEmail = await generateOtp();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        //Enregistrement de l'OTP si l'email n'existe pas encore deja sinon mis a jour du code
        await prisma.otpModel.upsert({
            where : {email : email},
            create : {
                email: email,
                code : String(codeEmail),
                expirateAt : expiresAt
            },
            update : {
                code : String(codeEmail),
                expirateAt : expiresAt
            }
        });

        return {
            codeOtp :codeEmail,
            expireTime : expiresAt
        };
    }

    //Fonction de validation de mail avec le lien 

    static async generateResetLink(user) {
        // Générer un token unique et aléatoire
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Définir l'expiration (ex: 1 heure)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Enregistrer en base de données
        // On nettoie les anciens tokens de cet utilisateur avant
        await prisma.otpModel.deleteMany({ where: { userId: user.id } });

        await prisma.otpModel.create({
            data: {
                code: resetToken,
                userId: user.id,
                expirateAt: expiresAt
            }
        });

        //  Construire le lien vers ton FRONTEND
        // Ne pointe PAS vers ton API, mais vers la page de ton site (React/Vue/Next)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        return resetLink;
    }    


    static async sendResetPasswordEmail(to, resetLink) {
        // 1. Configuration du transporteur
        // Exemple avec Gmail ou un service SMTP classique
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // 2. Préparation de l'email
        const mailOptions = {
            from: `"Support TonApp" <${process.env.MAIL_USER}>`,
            to: to,
            subject: "Réinitialisation de votre mot de passe",
            html: resetPasswordTemplate(resetLink), // On injecte le template ici
        };

        // 3. Envoi
        try {
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error("Erreur d'envoi d'email:", error);
            throw new Error("Impossible d'envoyer l'email de réinitialisation.");
        }
    }

    //Fonction d'envoi de l'otp
    static async SendOtpEmail(email, code, time){
        const data = {
            from : '"Nexus App" <no-reply@nexus.com>',
            to : email,
            subject : "Verification de votre compte",
            html : otpTemplate(code, time)
        };

       return  await this.transporter.sendMail(data);
    }

    
    //Fonction de verification du code OTP
    static async VerifyEmail(email, codeSaisi) { 
        const otpRecord = await prisma.otpModel.findUnique({ where: { email } });

        if (!otpRecord) {
            throw new NotFoundException("Aucun code de validation trouvé.");
        }

        // Comparaison en String pour éviter le bug du parseInt
        if (otpRecord.code !== String(codeSaisi)) {
            throw new BadRequestException("Code invalide");
        }

        // Vérification de l'expiration
        if (new Date() > otpRecord.expirateAt) {
            throw new BadRequestException("Le code a expiré");
        }

        // SUCCÈS : On valide l'user et on nettoie l'OTP
        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { isVerified: true }
            }),
            prisma.otpModel.delete({
                where: { email }
            })
        ]);

        return { success: true };
    }

    
}