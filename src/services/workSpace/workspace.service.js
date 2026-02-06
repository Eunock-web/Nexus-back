import { signToken } from "#lib/jwt";
import prisma from "#lib/prisma";


export class WorkSpaceService{

    //Fonction de creation d'un workspace
    static async createWorkSpace(data, userId) {
        const { name, slug, email } = data;

        // Préparation de l'objet de données pour Prisma
        const workspaceData = {
            name: name,
            slug: slug,
            ownerId: userId,
        };

        // Si un email est présent, on ajoute l'invitation de manière imbriquée
        if (email) {
            const inviteToken = await signToken({ email }, '15m'); // On passe un objet au token
            
            workspaceData.invitations = {
                create: {
                    email: email,
                    token: inviteToken,
                    invitedById: userId
                }
            };
        }

        // Une seule pile d'appel Prisma suffit
        const newWorkspace = await prisma.workSpace.create({
            data: workspaceData,
            include: {
                invitations: true // Pour vérifier que l'invitation est bien créée
            }
        });

        return {
            success: true,
            workspace: newWorkspace
        };
    }
}