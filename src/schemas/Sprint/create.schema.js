import z from "zod";


export const SprintSchema = z.object({
    name : z.string().min(3, "le nom doit faire au moins 3 lettres"),
    startDate : z.date(),
    endDate : z.date()
});