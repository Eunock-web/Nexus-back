import { UnauthorizedException } from "#lib/exceptions";
import { validateData } from "#lib/validate";
import { WorkSpaceSchema } from "#schemas/workspace/create.schema";
import { EmailSendService } from "#services/workSpace/sendEmail.service";
import { WorkSpaceService } from "#services/workSpace/workspace.service";


export class WorkSpaceController {
    //Fonction pour la creation d'un workspace
    static async createWorkspace(req, res) {
        try {
            const validatedData = validateData(WorkSpaceSchema, req.body)
            const userId = req.user.id;

            if (!userId) {
                throw new UnauthorizedException("Authentification requis");
            }


            const createWorkspace = await WorkSpaceService.createWorkSpace(validatedData, userId);

            if (createWorkspace.success) {
                return res.json({
                    success: true,
                    response: "Espace de travail creer avec success",
                    workspace: createWorkspace.workspace
                })
            } else {
                res.json({
                    success: false,
                    response: "Echec de la creation de l'espace de travail"
                })
            }
        } catch (erroor) {
            return res.json({
                success: false,
                error: erroor.message,
            })
        }
    }

    //Fonction pour la verification du lien d'invitation
    static async verifyInviteEmail(req, res) {
        try {
            const { token } = req.params;
            const { email } = req.query; // Extraction de l'email depuis la query string

            if (!token) {
                return res.status(400).json({ success: false, response: "Token manquant." });
            }

            if (!email) {
                return res.status(400).json({ success: false, response: "Email manquant." });
            }

            const verifyEmail = await EmailSendService.verifyInviteEmail(email, token);

            if (!verifyEmail.success) {
                return res.json({
                    success: false,
                    response: "Validation echouée"
                })
            }

            return res.json({
                success: true,
                response: "Validation effectué avec succes"
            })
        } catch (error) {
            res.json({
                success: false,
                response: error.message
            })
        }
    }

    //Fonction pour la recuperation de toutes les workspace
    static async getAll(req, res) {
        return await WorkSpaceService.getAllWorkspace();
    }

}