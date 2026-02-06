import z from "zod";


export const WorkSpaceSchema = z.object({
    name : z.string().min(3, "Le nom de l'espace de travail doit être au moins de trois lettres"),
    slug : z.string().min(10, "La description de l'espace de travail doit etre au moins de 10 lettres"),
    logoUrl : z.string(),
    email : z.string().email().optional()
}); 