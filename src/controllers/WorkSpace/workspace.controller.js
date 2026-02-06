import { UnauthorizedException } from "#lib/exceptions";
import { validateData } from "#lib/validate";
import { WorkSpaceSchema } from "#schemas/workspace/create.schema";
import { WorkSpaceService } from "#services/workSpace/workspace.service";


export class WorkSpaceController{
    //Fonction pour la creation d'un workspace
    static async createWorkspace(req, res){
        try{
            const validatedData = validateData(WorkSpaceSchema, req.body)
            const userId = req.user.id;

            if(!userId){
                throw new UnauthorizedException("Authentification requis");
            }


            const createWorkspace = await WorkSpaceService.createWorkSpace(validatedData, userId);

            if(createWorkspace.success){
                return res.json({
                    success : true,
                    response : "Espace de travail creer avec success",
                    workspace : createWorkspace.workspace
                })
            }else{
                res.json({
                    success : false,
                    response : "Echec de la creation de l'espace de travail"
                })
            }
        }catch(erroor){
            return res.json({
                success : false,
                error : erroor.message,
            })
        }
    }
}