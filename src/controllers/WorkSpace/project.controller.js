import { validateData } from "#lib/validate";
import { ProjectSchema } from "#schemas/workspace/project.schema";
import { ProjectService } from "#services/workSpace/project.service";


export class ProjectController{

        //Fonction pour la creation d'un projet
        static async createProject(req, res) {
            const validatedData = validateData(ProjectSchema, req.body);
            try{
                if(!validatedData){
                    return res.json({
                        success : false,
                        response : "Donnée requise"
                    })
                }
    
                const createProject = await ProjectService.createProject(validatedData);
                if(!createProject.success){
                    return res.json({
                        success : false,
                        response : "Donnée requise"
                    })
                }
                return res.status(200).json({
                    success : true,
                    response : "Projet créer avec success"
                });
            }catch(error){
                return res.status(500).json({
                    success : false,
                    response : error.message
                })
            }
        }
    
}