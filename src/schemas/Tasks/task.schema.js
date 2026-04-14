import z from "zod";


export const TaskSchema = z.object({
    title : z.string().min(3, "Le titre de la tache doit etre au minimum de trois lettre"),
    description : z.string(),
    startDate : z.date(),
    endDate : z.date()
})