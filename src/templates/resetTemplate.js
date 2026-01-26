// src/templates/resetPasswordTemplate.js

export const resetPasswordTemplate = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
            .header { text-align: center; color: #333; }
            .header1 { text-align: center; color: #1850abff; }
            .content { line-height: 1.6; color: #555; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: #4F46E5; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
            .warning { font-size: 12px; color: #999; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="header1" >Nexus-App</h1>
            <h2 class="header">Réinitialisation de votre mot de passe</h2>
            <div class="content">
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                <div class="button-container">
                    <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <p>Ce lien est valable pendant 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                <p class="warning">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur : <br> ${resetLink}</p>
            </div>
            <div class="footer">
                &copy; 2026 Ton Application. Tous droits réservés.
            </div>
        </div>
    </body>
    </html>
    `;
};