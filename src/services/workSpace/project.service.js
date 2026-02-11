import prisma from "#lib/prisma";


export class ProjectService {

    //Fonction pour la creation d'un projet
    static async createProject(data, workspaceId) {
        const { name, description, tagname, couleur } = data

        const projectCreate = await prisma.project.create({
            data: {
                name: name,
                description: description,
                workspaceId: parseInt(workspaceId)
            }
        });

        if (!projectCreate) {
            return {
                success: false,
                response: "erreur lors de la creation"
            }
        }

        await prisma.projectTag.create({
            data: {
                name: tagname,
                color: couleur,
                projectId: projectCreate.id
            }
        })

        return {
            success: true,
            response: "Projet créer avec success"
        }
    }

}