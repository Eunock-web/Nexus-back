import prisma from "#lib/prisma";
import { nodemailer } from nodemailer;
import { generateOtp } from "#lib/otp";

export class OtpService{
    
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
    static async SendOtp(){

    }

}