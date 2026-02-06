import { signToken } from "#lib/jwt";
import prisma from "#lib/prisma";
import { EmailSendService } from "./sendEmail.service";


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
            const userInfo = await prisma.user.findUnique({where : {id : userId}})
            const projectName = "Nexus App"
            //Envoie du token par email

            workspaceData.invitations = {
                create: {
                    email: email,
                    token: inviteToken,
                    invitedById: userId
                }
            };

            await EmailSendService.SendInviteEmail(email, inviteToken,userInfo.firstname,projectName, name);
        }

        // Une seule pile d'appel Prisma suffit
        const newWorkspace = await prisma.workSpace.create({
            data: workspaceData,
            include: {
                invitations: true // Pour vérifier que l'invitation est bien créée
            }
        });

        //Ajout de l'admin directement dans la table worksapcemember
        await prisma.workSpaceMembers.create({
            data : {
                role : "ADMIN",
                userId : userId,
                workSpaceId : last
            }
        })

        return {
            success: true,
            workspace: newWorkspace
        };
    }


    //Fonction pour recuperer la liste des workspaces 
    static async getAllWorkspace(){
        return  await prisma.workSpace.findMany({
            select : {
                name : true,
                slug : true,
                logoUrl : true,
                createdAt : true,
                workSpaceMembers : {
                    select : {
                        role : true,
                        user : {
                            select : {
                                firstname : true,
                                lastname : true,
                                avatarUrl : true,
                            }
                        }
                    }
                }
            }
        });
    }
}