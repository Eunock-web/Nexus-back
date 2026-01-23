import rateLimit from 'express-rate-limit';

// Limiteur pour le login et la 2FA
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 5, // Limite chaque IP à 5 tentatives par fenêtre
  message: {
    success: false,
    message: "Trop de tentatives. Réessayez dans 15 minutes."
  },
  standardHeaders: true, // Renvoie l'état de la limite dans les headers
  legacyHeaders: false,
});