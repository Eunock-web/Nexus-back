import axios from 'axios';

export const getClientLocation = async (req) => {
    // Vérification si on est sur Vercel (Production)
    // Vercel injecte automatiquement ces headers
    const vercelCity = req.headers['x-vercel-ip-city'];
    const vercelCountry = req.headers['x-vercel-ip-country'];

    if (vercelCity && vercelCountry) {
        return `${decodeURIComponent(vercelCity)}, ${vercelCountry}`;
    }

    // Si pas de headers Vercel, on utilise l'API (Développement)
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Simulation pour le localhost
        if (ip === '::1' || ip === '127.0.0.1') return "Localhost, Dev";

        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data.status === 'success') {
            return {
                success : true,
                result : `${response.data.city}, ${response.data.country}`
            };
        }
    } catch (error) {
        console.error("Erreur géo-api:", error.message);
    }

    return {
        success : false,
        result : "Location inconnue"
    };
};