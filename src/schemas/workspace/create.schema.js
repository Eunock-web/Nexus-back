import z from "zod";


export const WorkSpaceSchema = z.object({
    name: z.string().min(3, "Le nom de l'espace de travail doit être au moins de trois lettres"),
    slug: z.string().min(3, "Le slug de l'espace de travail doit être au moins de 3 lettres"),
    logoUrl: z.string().optional(),
    email: z.string().email().optional()
}); 