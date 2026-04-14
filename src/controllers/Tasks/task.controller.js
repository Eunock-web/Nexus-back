import { UnauthorizedException } from "#lib/exceptions";
import { validateData } from "#lib/validate";
import { TaskSchema } from "#schemas/Tasks/task.schema";


export class TaskController{

    //Fonction chargé de la creation d'une tache
    static async CreateTache(req, res){
        const validatedData = validateData(TaskSchema, req.body)
        const {sprintId} = req.params;

        if(!sprintId){
            throw new UnauthorizedException("L'id du projet est requis")
        }

        try{
            
        }catch(error){

        }
    }
}