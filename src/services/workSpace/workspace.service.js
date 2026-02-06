import { signToken } from "#lib/jwt";
import prisma from "#lib/prisma";


export class WorkSpaceService{

    //Fonction de creation d'un workspace
    static async createWorkSpace(data, userId){

        const {name, slug,email} = data;

        //Verification si  email a ete renseigner
        if(!email){
            await prisma.workSpace.create({
                data: {
                    name : name,
                    slug : slug,
                    ownerId : userId
                }
            });
            
            return {
                success : true,
            }
        }

        //Generation du token d'invitation
        const inviteToken = await signToken(email, '15m');

        await prisma.workSpace.create({
            data : {
                name : name,
                slug : slug,
                ownerId : userId,
                invitations : {
                    email : email,
                    token : inviteToken,
                    workspaceId :  LargestContentfulPaint,
                    invitedById : userId
                }
            }
        })

    }

}