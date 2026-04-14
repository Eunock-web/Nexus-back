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
            const userId = req.user.id ;

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

            if (!token) {
                return res.status(400).json({ success: false, response: "Token manquant." });
            }

            const verifyEmail = await EmailSendService.verifyInviteEmail(token);

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
        const workspaces = await WorkSpaceService.getAllWorkspace();
        return res.json({
            success: true,
            workspaces: workspaces
        });
    }

    //Fonction pour la recuperation des workspaces d'un utilisateur
    static async getWorkspaceByUser(req, res) {
        try {
            const userId = req.user.id;

            if (!userId) {
                throw new UnauthorizedException("Authentification requis");
            }

            const workspaces = await WorkSpaceService.getWorkspaceByUser(userId);
            if(workspaces.success){
                return res.json({
                    success: true,
                    workspaces: workspaces.data
                });
            }else{
                return res.json({
                    success: false,
                    response: "Echec de la recuperation des workspaces"
                })
            }
        } catch (error) {
            res.json({
                success: false,
                response: error.message
            })
        }
    }

    //Fonction pour la recuperation des details d'un workspace
    static async getWorkspaceById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new UnauthorizedException("Authentification requis");
            }

            const workspace = await WorkSpaceService.getWorkspaceById(id);
            if(workspace.success){
                return res.json({
                    success: true,
                    workspace: workspace.data
                });
            }else{
                return res.json({
                    success: false,
                    response: "Echec de la recuperation du workspace"
                })
            }
        } catch (error) {
            res.json({
                success: false,
                response: error.message
            })
        }
    }

    //Fonction pour la recuperation des membres d'un workspace
    static async getWorkspaceMembers(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new UnauthorizedException("Authentification requis");
            }

            const members = await WorkSpaceService.getWorkspaceMembers(id);
            if(members.success){
                return res.json({
                    success: true,
                    members: members.data
                });
            }else{
                return res.json({
                    success: false,
                    response: "Echec de la recuperation des membres"
                })
            }
        } catch (error) {
            res.json({
                success: false,
                response: error.message
            })
        }
    }
}