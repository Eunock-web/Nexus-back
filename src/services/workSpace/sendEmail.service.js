import { NotFoundException } from "#lib/exceptions";
import prisma from "#lib/prisma";
import { invitationTemplate } from "../../templates/InviteLink";


export class EmailSendService{
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

        //Fonction d'envoi de lien d'invitation
        static async SendInviteEmail(email, code, inviterName, projectName, workSpaceName){
            const data = {
                from : '"Nexus App" <no-reply@nexus.com>',
                to : email,
                subject : "Invitation ",
                html : invitationTemplate(code, time, inviterName, projectName, workSpaceName)
            };
    
           return  await this.transporter.sendMail(data);
        }

        //Fonction de verification du mail et ajout au workspace
        static async verifyInviteEmail(email, token){
            const user = await prisma.invitation.findUnique({
                where : {token : token}
            });

            const workSpaceId = await prisma.user.findUnique(email);

            if (!user){
                throw new NotFoundException("Token innexistant");
            }

            if(user.email !== email){
                return {
                    success : false,
                    response : "Lien Invalide"
                }
            }

            //Suppression du lien d'inviation de la table invitation
            await prisma.invitation.deleteMany({where : {token : token}});

            //Ajout de l'utilisateur dans la table WorkspaceMember
            await prisma.workSpaceMembers.create({
                data : {
                    userId : user.id,
                    workSpaceId : workSpaceId.id
                }
            })

            return {
                success : true,
                response : "Lien valider avec success"
            }
        }
    
}