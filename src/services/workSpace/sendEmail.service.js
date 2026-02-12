import nodemailer from "nodemailer";
import { NotFoundException } from "#lib/exceptions";
import prisma from "#lib/prisma";
import { invitationTemplate } from "../../templates/InviteLink.js";
import { jwtVerify } from "jose";


export class EmailSendService {
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
    static async sendInviteEmail(email, code, inviterName, projectName, workSpaceName) { 
        const data = {
            from: '"Nexus App" <no-reply@nexus.com>',
            to: email,
            subject: "Invitation ",
            html: invitationTemplate(code, inviterName, projectName, workSpaceName) 
        };

        return await this.transporter.sendMail(data);
    }

    //Fonction de verification du mail et ajout au workspace
    static async verifyInviteEmail(token) {
        // En supposant que le token est stocké dans une table 'invitation'
        const invitation = await prisma.invitation.findUnique({
            where: { token: token }
        });

        if (!invitation) {
            throw new NotFoundException("Token inexistant");
        }

        //Retrait du mail depuis le token
        //Encodage de la cle secrete pour la cerification du payload
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        //Verification du token
            const {payload} = await jwtVerify(token, secret);

            console.log(payload);

        const email = payload.sub
        // const email = payload.email;

        if (invitation.email !== email) {
            return {
                success: false,
                response: "Ce lien n'est pas associer a votre email"
            }
        }

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
             where: { email: email }
        });

        if (!user) {
             throw new NotFoundException("Utilisateur non trouvé avec cet email");
        }

        //Suppression du lien d'inviation de la table invitation
        await prisma.invitation.delete({ where: { token: token } }); 

        //Ajout de l'utilisateur dans la table WorkspaceMember
        // Note: 'workSpaceId' dans votre code original semblait être le résultat d'une recherche user, ce qui était confus.
        // Je suppose que l'invitation contient le workSpaceId ou qu'on doit le récupérer autrement.
        // Si l'invitation a été créée avec workSpaceId, on peut l'utiliser.
        // Disons que l'invitation a un champ workSpaceId ou invitedById qui nous aide,
        // MAIS dans votre code précédent createWorkspace, vous faisiez:
        // workspaceData.invitations = { create: { ... } } -> donc l'invitation est liée au workspace.

        if (invitation.workspaceId) {
             await prisma.workSpaceMembers.create({
                data: {
                    userId: user.id,
                    workSpaceId: invitation.workSpaceId
                }
            })
        } else {
                return {
                success: true,
                response: "Lien validé avec succès"
            }
        }

        return {
            success: true,
            response: "Lien validé avec succès"
        }
    }

}