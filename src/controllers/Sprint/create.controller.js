import { UnauthorizedException } from "#lib/exceptions";
import { validateData } from "#lib/validate";
import { SprintSchema } from "#schemas/Sprint/create.schema";
import { SprintService } from "#services/Sprint/sprint.service";


export class SprintController{
    static async create(req, res){
        const validatedData = validateData(SprintSchema, req.body);
        const projectId = req.params;

        if(!projectId){
            throw new UnauthorizedException("L'id du projet est requis")
        }

        try{
            const result = await SprintService.CreateSprint(validatedData, projectId);

            if(result.success){
                return res.json({
                    success : false,
                    response : "Sprint Créez avec success",
                    data : result.data
                })
            }


        }catch(error){
            res.status().json({
                success : false,
                reponse : error.message
            })
        }
    }
    
}