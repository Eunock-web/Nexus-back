import {z} from 'zod';

export const OtpSchema = z.object({
    email : z.string().email('Email invalide'),
    code : z.int().optional()
})