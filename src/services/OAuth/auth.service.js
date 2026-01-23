import { OAuth2Client } from "google-auth-library";

//Configuration pour recuperer les identifiants sur la console google cloud
const client = new OAuth2Client(
    process.env.GOOGLE_ID_CLIENT,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export class OAuthService{

    //Fonction de redirection vers google
    static async refirectToGoogle(){
        const url = client.generateAuthUrl({
            access_type : 'offline',
            scope : ['profile', 'email'],
            prompt : 'consent'
        });

        return url;
    }

    //Fonction pour la gestion du callBack google
    static async handleGoogleAuth(code, meta){
        //Echange le code dans l'url contre les tokens
        const {tokens} = await client.getToken(code);
        client.setCredentials(tokens);

        //Recuperer les infos de l'utilisateur via le token
        const ticket = await client.verifyIdToken({
            idToken : tokens.id_token,
            audience : process.env.GOOGLE_ID_CLIENT
        });

        //Extraire les informations de l'utilisateur depuis le ticket
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        //Importer le service utilisateur pour gérer la création/récupération
        const { UserService } = await import('../auth/user.service.js');
        
        //Utiliser la méthode de UserService pour trouver ou créer l'utilisateur OAuth
        const result = await UserService.findOrCreateOAuthUser({
            email,
            name,
            picture,
            provider: 'google',
            providerAccountId: sub
        }, meta);

        return result;
    }
}