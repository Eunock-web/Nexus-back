import { signToken } from "#lib/jwt";
import prisma from "#lib/prisma";
import { EmailSendService } from "./sendEmail.service.js";


export class WorkSpaceService {

    //Fonction de creation d'un workspace
    static async createWorkSpace(data, userId) {
        const { name, slug, email } = data;

        // Préparation de l'objet de données pour Prisma
        const workspaceData = {
            name: name,
            slug: slug,
            ownerId: userId,
        };

        const userInfo = await prisma.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new Error("User not found"); // Simple error handling, ideally use a custom exception
        }
        const projectName = "Nexus App";

        // Si un email est présent, on ajoute l'invitation de manière imbriquée
        if (email) {
            const inviteToken = await signToken({ email }, '15m');

            //Envoie du token par email
            workspaceData.invitations = {
                create: {
                    email: email,
                    token: inviteToken,
                    invitedById: userId
                }
            };

            const inviteLink = `${process.env.FRONTEND_URL}verify/${inviteToken}`
            await EmailSendService.sendInviteEmail(email, inviteLink, userInfo.firstname, projectName, name);
        }

        const newWorkspace = await prisma.workSpace.create({
            data: workspaceData,
            include: {
                invitations: true // Pour vérifier que l'invitation est bien créée
            }
        });

        //Ajout du createur du projet directement dans la table worksapcemember
        await prisma.workSpaceMembers.create({
            data: {
                role: "OWNER",
                userId: userId,
                workSpaceId: newWorkspace.id
            }
        })

        return {
            success: true,
            workspace: newWorkspace
        };
    }


    //Fonction pour recuperer la liste des workspaces 
    static async getAllWorkspace() {
        return await prisma.workSpace.findMany({
            select: {
                name: true,
                slug: true,
                logoUrl: true,
                createdAt: true,
                workSpaceMembers: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                firstname: true,
                                lastname: true,
                                avatarUrl: true,
                            }
                        }
                    }
                }
            }
        });
    }

}