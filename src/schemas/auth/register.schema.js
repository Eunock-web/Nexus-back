import { email, optional, z } from 'zod';


// Taille max : 5Mo (exemple)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const registerSchema = z.object({

  email : z.string().email('Email invalide'),
  password : z.string()
              .min(8, "Il faut au moins 8 caractères")       
              .regex(/[A-Z]/, "Il faut au moins un majuscule")       
              .regex(/[a-z]/, "Il faut au moins un minuscule")       
              .regex(/[0-9]/, "Il faut au moins un nombre"),
              
  firstname : z.string().min(3, "Minimum 3 caractères").optional(),
  lastname : z.string().min(3, "Minimum 3 caractères").optional(),
  avatarUrl : z.any()
               .string()
              .optional(),
               
});