import { UnauthorizedException } from "#lib/exceptions";
import { validateData } from "#lib/validate";
import { ProjectSchema } from "#schemas/workspace/project.schema";


export class TaskController{

    //Fonction chargé de la creation d'une tache
    static async CreateTache(req, res){
        const validatedData = validateData(ProjectSchema, req.body)
        const {projectId} = req.params;

        try{
            if(projectId){
                throw new UnauthorizedException("L'id du projet est requis")
            }
        }catch(error){

        }
    }
}