// src/templates/invitationTemplate.js

export const invitationTemplate = (invitationLink, inviterName, projectName, workspaceName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
            .header-subtitle { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; color: #2d3748; margin-bottom: 20px; font-weight: 600; }
            .message { line-height: 1.8; color: #4a5568; font-size: 15px; margin-bottom: 15px; }
            .highlight { background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
            .highlight-title { color: #667eea; font-weight: 600; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
            .highlight-content { color: #2d3748; font-size: 18px; font-weight: 600; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
            .button:hover { transform: translateY(-2px); }
            .features { margin: 30px 0; }
            .feature-item { display: flex; align-items: start; margin-bottom: 15px; }
            .feature-icon { width: 24px; height: 24px; background-color: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; margin-right: 12px; flex-shrink: 0; margin-top: 2px; }
            .feature-text { color: #4a5568; font-size: 14px; line-height: 1.6; }
            .link-section { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .link-label { font-size: 12px; color: #718096; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .link-url { word-break: break-all; color: #667eea; font-size: 13px; font-family: monospace; }
            .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; }
            .footer { background-color: #f7fafc; padding: 30px; text-align: center; }
            .footer-text { font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 15px; }
            .social-links { margin: 20px 0; }
            .social-link { display: inline-block; margin: 0 8px; color: #a0aec0; text-decoration: none; font-size: 12px; }
            .copyright { font-size: 12px; color: #a0aec0; margin-top: 20px; }
            
            @media only screen and (max-width: 600px) {
                .container { border-radius: 0; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .logo { font-size: 28px; }
                .greeting { font-size: 20px; }
                .button { padding: 14px 30px; font-size: 15px; }
                .footer { padding: 25px 20px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">✦ NEXUS</div>
                <div class="header-subtitle">Gestion de Projet Collaborative</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">Vous êtes invité(e) ! 🎉</div>
                
                <p class="message">
                    Bonjour,
                </p>
                
                <p class="message">
                    <strong>${inviterName}</strong> vous invite à rejoindre un espace de travail sur <strong>Nexus</strong>, 
                    la plateforme de gestion de projet qui simplifie la collaboration d'équipe.
                </p>
                
                ${workspaceName ? `
                <div class="highlight">
                    <div class="highlight-title">Espace de travail</div>
                    <div class="highlight-content">${workspaceName}</div>
                </div>
                ` : ''}
                
                ${projectName ? `
                <div class="highlight">
                    <div class="highlight-title">Projet</div>
                    <div class="highlight-content">${projectName}</div>
                </div>
                ` : ''}
                
                <div class="button-container">
                    <a href="${invitationLink}" class="button">Accepter l'invitation</a>
                </div>
                
                <p class="message">
                    En rejoignant cet espace, vous pourrez :
                </p>
                
                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div class="feature-text">Collaborer avec votre équipe en temps réel</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div class="feature-text">Organiser vos tâches avec des tableaux Kanban</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div class="feature-text">Suivre l'avancement de vos projets</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <div class="feature-text">Partager des fichiers et des commentaires</div>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <p class="message" style="font-size: 13px; color: #718096;">
                    <strong>Note :</strong> Ce lien d'invitation est valable pendant 7 jours. 
                    Si vous n'êtes pas à l'origine de cette demande ou si vous ne souhaitez pas rejoindre 
                    cet espace, vous pouvez ignorer cet e-mail en toute sécurité.
                </p>
                
                <div class="link-section">
                    <div class="link-label">Si le bouton ne fonctionne pas, copiez ce lien :</div>
                    <div class="link-url">${invitationLink}</div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                    Vous recevez cet e-mail car quelqu'un vous a invité à rejoindre un espace de travail sur Nexus.
                </p>
                
                <div class="social-links">
                    <a href="#" class="social-link">Site Web</a> · 
                    <a href="#" class="social-link">Aide</a> · 
                    <a href="#" class="social-link">Confidentialité</a>
                </div>
                
                <div class="copyright">
                    &copy; 2026 Nexus-App. Tous droits réservés.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};