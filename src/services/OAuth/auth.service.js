import { OAuth2Client } from "google-auth-library";

//Configuration pour recuperer les identifiants sur la console google cloud
const googleClient = new OAuth2Client(
    process.env.GOOGLE_ID_CLIENT,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export class OAuthService{

    //Fonction de redirection vers google
    static async refirectToGoogle(){
        const url = googleClient.generateAuthUrl({
            access_type : 'offline',
            scope : ['profile', 'email'],
            prompt : 'consent'
        });

        return url;
    }

    //Fonction pour la gestion du callBack google
    static async handleGoogleAuth(code, meta){
        //Echange le code dans l'url contre les tokens
        const {tokens} = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        //Recuperer les infos de l'utilisateur via le token
        const ticket = await googleClient.verifyIdToken({
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


    /**
     * Génère l'URL de redirection vers GitHub OAuth
     */
    static async redirectToGithub() {
        const scopes = ['user:email'];
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        
        githubAuthUrl.searchParams.append('client_id', process.env.GITHUB_ID_CLIENT);
        githubAuthUrl.searchParams.append('redirect_uri', process.env.GITHUB_REDIRECT_URI);
        githubAuthUrl.searchParams.append('scope', scopes.join(' '));
        githubAuthUrl.searchParams.append('allow_signup', 'true');

        return githubAuthUrl.toString();
    }

    /**
     * Gère le callback GitHub OAuth
     * Échange le code contre un token d'accès et récupère les infos utilisateur
     */
    static async handleGithubAuth(code, meta) {
        if (!code) {
            throw new Error('Code d\'authentification GitHub manquant');
        }

        try {
            // Étape 1: Échanger le code contre un token d'accès
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_ID_CLIENT,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code: code
                })
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                throw new Error(`Erreur GitHub: ${tokenData.error_description}`);
            }

            const accessToken = tokenData.access_token;

            // Étape 2: Récupérer les informations de l'utilisateur
            const userResponse = await fetch('https://api.github.com/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const githubUser = await userResponse.json();

            // Étape 3: Récupérer l'email public de GitHub (si pas d'email public)
            let email = githubUser.email;
            
            if (!email) {
                const emailResponse = await fetch('https://api.github.com/user/emails', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                const emails = await emailResponse.json();
                const primaryEmail = emails.find(e => e.primary);
                email = primaryEmail?.email || emails[0]?.email;
            }

            // Étape 4: Créer ou récupérer l'utilisateur
            const { UserService } = await import('../auth/user.service.js');

            const result = await UserService.findOrCreateOAuthUser({
                email,
                name: githubUser.name || githubUser.login,
                picture: githubUser.avatar_url,
                provider: 'github',
                providerAccountId: githubUser.id.toString()
            }, meta);

            return result;

        } catch (error) {
            console.error('Erreur GitHub OAuth:', error);
            throw new Error(`Authentification GitHub échouée: ${error.message}`);
        }
    }
}