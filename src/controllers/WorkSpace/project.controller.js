import { validateData } from "#lib/validate";
import { ProjectSchema } from "#schemas/workspace/project.schema";
import { ProjectService } from "#services/workSpace/project.service";


export class ProjectController {

    //Fonction pour la creation d'un projet
    static async createProject(req, res) {
        const { workspaceId } = req.params;
        const validatedData = validateData(ProjectSchema, req.body);

        try {
            if (!validatedData) {
                return res.json({
                    success: false,
                    response: "Donnée requise"
                })
            }

            const result = await ProjectService.createProject(validatedData, workspaceId);
            if (!result.success) {
                return res.json({
                    success: false,
                    response: result.response || "Erreur lors de la création du projet"
                })
            }
            return res.status(200).json({
                success: true,
                message: "Projet créer avec success",
                response : result.data
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                response: error.message
            })
        }
    }

}