import prisma from "#lib/prisma";
import nodemailer from 'nodemailer'
import { generateOtp } from "#lib/otp";
import { otpTemplate } from "../../templates/otp-email.js";
import { response } from "express";

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
    static async VerifyEmail(email, codeSaisi){

        try{
            //Recuperer le code en fonction de l'email

            const emailUser = await prisma.otpModel.findUnique({where : {email : email}});

            if(!emailUser){
                throw new NotFoundException("Veuillez valider votre compte");
            }

            if(emailUser.code !== codeSaisi){
                throw new NotFoundException("Code invalide");
            }

            if(new Date() > emailUser.expirateAt){

            }

            await prisma.user.update({
                where : {email },
                data : {isVerified : true}
            });

            await prisma.user.delete({
                where : {email },
            });

            return {
                success : true,
                response : "Email vérifié avec success"
            }
        }catch(error){

        }
    }

}