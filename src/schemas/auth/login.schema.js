import { z } from 'zod'

export const LoginValidation = z.object({
  email: z.string().email("Email invalide"),
  password : z.string()
              .min(8, "Il faut au moins 8 caractères")       
              .regex(/[A-Z]/, "Il faut au moins un majuscule")       
              .regex(/[a-z]/, "Il faut au moins un minuscule")       
              .regex(/[0-9]/, "Il faut au moins un nombre"),
})

