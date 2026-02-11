import prisma from "#lib/prisma";


export class ProjectService {

    //Fonction pour la creation d'un projet
    static async createProject(data){
        const {name, description, tagname, couleur} = data

        const projectCreate = await prisma.project.create({
            data : {
                name : name,
                description :description
            }
        });

        if(!projectCreate){
            return {
                status : false,
                reponse : "erreur lors de la creation"
            }
        }

        const project = await prisma.project.findFirst();

        await prisma.projectTag.create({
            data : {
                name : tagname,
                color : couleur,
                projectId : project.id
            }
        })

        return {
            success : true,
            response : "Projet créer avec success"
        }
    }

}