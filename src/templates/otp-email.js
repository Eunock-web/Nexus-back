export const otpTemplate = (code, time) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre code de vérification</title>
    <style>
        /* Styles de base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f5f8fa;
            color: #333333;
            line-height: 1.6;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            display: inline-block;
        }
        
        .logo-icon {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            line-height: 40px;
            margin-right: 10px;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .intro-text {
            margin-bottom: 30px;
            color: #555555;
            font-size: 16px;
        }
        
        /* Zone OTP */
        .otp-container {
            background-color: #f8f9ff;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #e6e9ff;
        }
        
        .otp-label {
            font-size: 16px;
            color: #666;
            margin-bottom: 15px;
            display: block;
        }
        
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #2d3b8b;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 15px auto;
            display: inline-block;
            box-shadow: 0 2px 10px rgba(45, 59, 139, 0.1);
            border: 2px dashed #6a11cb;
        }
        
        .otp-expiry {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 15px;
            font-weight: 600;
        }
        
        /* Instructions */
        .instructions {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 25px;
            margin-top: 30px;
            border-left: 4px solid #6a11cb;
        }
        
        .instructions h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .instructions ul {
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 10px;
            color: #555;
        }
        
        /* Footer */
        .footer {
            background-color: #f1f3f9;
            padding: 25px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
        }
        
        .warning {
            color: #ff6b6b;
            font-weight: 600;
            margin: 15px 0;
            font-size: 13px;
        }
        
        .contact {
            margin-top: 20px;
            color: #777;
            font-size: 13px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(106, 17, 203, 0.3);
        }
        
        /* Responsive */
        @media screen and (max-width: 600px) {
            .email-container {
                border-radius: 8px;
            }
            
            .header {
                padding: 25px 15px;
            }
            
            .header h1 {
                font-size: 22px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 32px;
                letter-spacing: 6px;
                padding: 15px;
            }
            
            .instructions, .otp-container {
                padding: 20px;
            }
            
            .footer {
                padding: 20px;
            }
        }
        
        @media screen and (max-width: 400px) {
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">✓</span>SecureVerify
            </div>
            <h1>Vérification de votre compte</h1>
            <p>Utilisez le code ci-dessous pour confirmer votre adresse email</p>
        </div>
        
        <div class="content">
            <p class="intro-text">
                Bonjour,<br><br>
                Vous avez demandé une vérification de votre adresse email. Pour compléter le processus, veuillez utiliser le code de vérification à usage unique (OTP) ci-dessous.
            </p>
            
            <div class="otp-container">
                <span class="otp-label">Votre code de vérification :</span>
                <div class="otp-code">${code}</div>
                <div class="otp-expiry">⚠️ Ce code expirera dans ${time} minutes</div>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="#" class="button">Vérifier mon compte</a>
            </p>
            
            <div class="instructions">
                <h3>Instructions :</h3>
                <ul>
                    <li>Copiez ce code et collez-le dans le champ prévu sur notre site</li>
                    <li>Vous pouvez également cliquer sur le bouton "Vérifier mon compte" ci-dessus</li>
                    <li>Ne partagez jamais ce code avec qui que ce soit</li>
                    <li>Si vous n'avez pas demandé ce code, veuillez ignorer cet email</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <div class="warning">
                Pour votre sécurité, ne partagez jamais ce code avec qui que ce soit.
            </div>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <div class="contact">
                © 2023 SecureVerify. Tous droits réservés.<br>
                Support: support@secureverify.com | Site: www.secureverify.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Exemple d'utilisation :
// const htmlContent = otpTemplate("429781");
// console.log(htmlContent);