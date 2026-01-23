import {z} from 'zod';

export const TwoFASchema = z.object({
    code : z.int().min(6, "Le code doit etre a 6 chiffre code Invalide").max(6, "Le code doit etre a 6 chiffre code Invalide").optional(),
    token : z.string()
})