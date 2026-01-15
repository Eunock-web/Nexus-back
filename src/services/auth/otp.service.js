import prisma from "#lib/prisma";
import { nodemailer } from nodemailer;
import { generateOtp } from "#lib/otp";
import { otpTemplate } from "../../templates/otp-email";

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
        const expiresAt = new Date(new Date() + 15 * 60 * 1000);

        //Enregistrement de l'OTP si l'email n'existe pas encore deja sinon mis a jour du code
        await prisma.otpModel.upsert({
            where : {email},
            create : {
                email,
                code : codeEmail,
                expiratedAt : expiresAt
            },
            update : {
                code : codeEmail,
                expiratedAt : expiresAt
            }
        });

        return codeEmail;
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

}