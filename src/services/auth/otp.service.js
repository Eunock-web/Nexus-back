import prisma from "#lib/prisma";
import nodemailer from 'nodemailer'
import { generateOtp } from "#lib/otp";
import { otpTemplate } from "../../templates/otp-email.js";
import {resetPasswordTemplate} from "../../templates/resetTemplate.js"
import { BadRequestException, NotFoundException } from "#lib/exceptions";
import { signToken } from "#lib/jwt";

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
        const resetToken = await signToken({sub : user.email} ,'1h');
        
        // Définir l'expiration (ex: 1 heure)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Enregistrer en base de données
        // On nettoie les anciens tokens de cet utilisateur avant
        await prisma.otpModel.deleteMany({ where: { email: user.email } });

        await prisma.otpModel.create({
            data: {
                code: resetToken,
                email: user.email,
                expirateAt: expiresAt
            }
        });

        //  Construire le lien vers le FRONTEND
        const resetLink = `${process.env.FRONTEND_URL}api/reset-password/${resetToken}`;

        return resetLink;
    }    


    static async sendResetPasswordEmail(to, resetLink) {
        // Préparation de l'email
        const mailOptions = {
            from: "Support Nexus" ,
            to: to,
            subject: "Réinitialisation de votre mot de passe",
            html: resetPasswordTemplate(resetLink), // On injecte le template ici
        };

        // Envoi
        try {
            await this.transporter.sendMail(mailOptions);
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
            throw new NotFoundException("Aucun code de validation trouvé ou votre compte a deja été validé.");
            
        }
        
        // Comparaison en String pour éviter le bug du parseInt
        if (otpRecord.code !== String(codeSaisi)) {
            throw new BadRequestException("Code invalide");
        }
        
        const userIsVerifyEmail = await prisma.user.findUnique({where : {email }});

        if(!userIsVerifyEmail){
            throw new NotFoundException("Aucun utilisateur trouvé.");
        }

        //Verifiez si le compte avait déja ete valider
        if(userIsVerifyEmail.isVerified){
            throw new BadRequestException("Votre compte a deja ete validé");
        }

        // Vérification de l'expiration
        if (new Date() > otpRecord.expirateAt ) {
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