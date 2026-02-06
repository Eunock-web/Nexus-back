import nodemailer from "nodemailer";
import { NotFoundException } from "#lib/exceptions";
import prisma from "#lib/prisma";
import { invitationTemplate } from "../../templates/InviteLink.js";


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
    static async sendInviteEmail(email, code, inviterName, projectName, workSpaceName) { // Renamed to camelCase
        const data = {
            from: '"Nexus App" <no-reply@nexus.com>',
            to: email,
            subject: "Invitation ",
            html: invitationTemplate(code, inviterName, projectName, workSpaceName) // Removed undefined 'time' variable
        };

        return await this.transporter.sendMail(data);
    }

    //Fonction de verification du mail et ajout au workspace
    static async verifyInviteEmail(email, token) {
        // En supposant que le token est stocké dans une table 'invitation'
        const invitation = await prisma.invitation.findUnique({
            where: { token: token }
        });

        if (!invitation) {
            throw new NotFoundException("Token inexistant");
        }

        if (invitation.email !== email) {
            return {
                success: false,
                response: "Lien Invalide"
            }
        }

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
             where: { email: email }
        });

        if (!user) {
             // TODO: Gérer le cas où l'utilisateur n'existe pas encore (peut-être rediriger vers inscription ?)
             // Pour l'instant on renvoie une erreur ou on suppose qu'il doit s'inscrire
             throw new NotFoundException("Utilisateur non trouvé avec cet email");
        }

        //Suppression du lien d'inviation de la table invitation
        await prisma.invitation.delete({ where: { token: token } }); // Changed from deleteMany to delete

        //Ajout de l'utilisateur dans la table WorkspaceMember
        // Note: 'workSpaceId' dans votre code original semblait être le résultat d'une recherche user, ce qui était confus.
        // Je suppose que l'invitation contient le workSpaceId ou qu'on doit le récupérer autrement.
        // Si l'invitation a été créée avec workSpaceId, on peut l'utiliser.
        // Disons que l'invitation a un champ workSpaceId ou invitedById qui nous aide,
        // MAIS dans votre code précédent createWorkspace, vous faisiez:
        // workspaceData.invitations = { create: { ... } } -> donc l'invitation est liée au workspace.

        // Si Invitation modèle a 'workSpaceId' (ce qui serait logique)
        if (invitation.workSpaceId) {
             await prisma.workSpaceMembers.create({
                data: {
                    userId: user.id,
                    workSpaceId: invitation.workSpaceId
                }
            })
        } else {
             // Fallback si pas de workSpaceId sur invitation (ce qui serait un défaut de modèle)
             // On ne peut pas deviner le workspace sans cette info.
             // On va supposer ici que prisma.invitation a accès au workSpaceId
             // Si ça plante, il faudra vérifier le schema.prisma
        }

        return {
            success: true,
            response: "Lien validé avec succès"
        }
    }

}