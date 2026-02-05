import { UserService } from "#services/auth/user.service";
import { UserDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";
import { OtpService } from "#services/auth/otp.service";
import { TwoFactorService } from "#services/auth/TwoFA.service";
import prisma from "#lib/prisma";
import { NotFoundException } from "#lib/exceptions";
import { loginSchema } from "#schemas/auth/login.schema";
import { decodeJwt } from "jose";

export class UserController {

  static async register(req, res) {
    try{
        const validatedData = validateData(registerSchema, req.body);
        const user = await UserService.register(validatedData);
    
        const EmailData = await OtpService.SaveOtp(user.email);
        await OtpService.SendOtpEmail(user.email, EmailData.codeOtp, EmailData.expireTime);
    
        res.status(201).json({
          success: true,
          response : "Inscription éffectué avec succes", 
          otpResponse : "Un code de validation vous a ete envoyer",
          user: UserDto.transform(user),
        });
    }catch(error){
      console.error("Erreur lors du register:", error);
    
      return res.status(error.status || 500).json({
        success: false,
        response: error.message || "Une erreur est survenue lors de l'inscription.",
      });
    }
  }

  //Fonction de Login
  static async login(req, res, next) {
      try {
          const validatedData = validateData(loginSchema, req.body)
          const { email, password } = validatedData;
          const meta = { 
              userAgent: req.headers['user-agent'] || '', 
              ipAddress: req.ip 
          };

          const result = await UserService.login(email, password, meta);

          // --- CAS 2FA ---
          if (result.requires2FA) {
              return res.json({
                  success: true,
                  requires2FA: true,
                  mfaToken: result.mfaToken, // On l'envoie dans le JSON
                  message: "Veuillez entrer votre code de sécurité"
              });
          }

          // --- CAS NORMAL ---
          const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
              path: '/'
          };

          // On place l'AccessToken dans le cookie
          res.cookie('refreshToken', result.refreshToken, cookieOptions);
          const user = await prisma.user.findUnique({where : {email : email}});
          return res.json({
              success: true,
              user : user,
              response: "Connexion réussie",
              accessToken : result.accessToken,
              refreshToken: result.refreshToken 
          });

      } catch (error) {
          console.error("DÉTAIL ERREUR LOGIN:", error); 
          next(error);
          return res.status(error.statusCode || 500).json({ 
              success: false, 
              response: error.message || "Erreur interne du serveur"
          });
      }
  }
      
      //Fonction pour la gestion du mot de passe oublié (prend l'email et envoi le code otp)
      static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Vérifier si l'user existe
            const user = await prisma.user.findUnique({ where: { email } });
            
            // Même si l'user n'existe pas, on répond "Email envoyé" 
            // pour éviter que les pirates listent tes utilisateurs.
            if (!user) {
                return res.json({ success: true, response: "Si cet email existe, un lien a été envoyé." });
            }

            // Générer le lien
            const resetLink = await OtpService.generateResetLink(user);

            //Envoyer l'email (Via ton MailerService)
            await OtpService.sendResetPasswordEmail(user.email, resetLink);
            
            return res.json({
                success: true,
                response: "Le lien de réinitialisation a été envoyé par email."
            });

        } catch (error) {
            return res.status(500).json({ success: false, response: error.message });
        }
      }

  //Fonction pour la verification de l'url envoyer dans le mail
  static async verifyResetToken(req, res) {
      try {
          const { token } = req.params;
          console.log(token)

          if (!token) {
              return res.status(400).json({ success: false, response: "Token manquant." });
          }

          // Chercher le token en base
          const otpRecord = await prisma.otpModel.findFirst({
              where: { code: token }
          });

          //  Vérifier si le token existe
          if (!otpRecord) {
              return res.status(404).json({ 
                  success: false, 
                  response: "Lien invalide ou déjà utilisé." 
              });
          }

          // Vérifier l'expiration
          const isExpired = new Date() > new Date(otpRecord.expirateAt);
          if (isExpired) {
              // Supprimer le token expiré pour nettoyer la base
              await prisma.otpModel.delete({ where: { id: otpRecord.id } });
              
              return res.status(410).json({ 
                  success: false, 
                  response: "Ce lien a expiré. Veuillez refaire une demande." 
              });
          }

          // Succès : On confirme que le token est valide
          // On ne change pas encore le mot de passe ici, on valide juste l'accès au formulaire
          return res.status(200).json({
              success: true,
              response: "Token valide.",
              email: otpRecord.email // Optionnel: renvoyer l'email pour aider le front
          });

      } catch (error) {
          console.error("Erreur Reset Password:", error);
          return res.status(500).json({ 
              success: false, 
              response: "Une erreur interne est survenue." 
          });
      }
  }

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * 
   * Cette fonction recevra le mail et le password que le front enverra l'email sera recuperer apres la verification du lien de validation
   */
  static async updatePassword(req, res){
    try{
      const validatedData = validateData(loginSchema, req.body)
      const { email, password } = validatedData;

      if(!password && !email){
        throw NotFoundException('Données non reçu');
      }

      const updatePassword = await UserService.updatePassword(email, password);

      if(updatePassword.success == true){
        res.json({
          success : true,
          response : "Mot de passe mis a jour avec success"
        })
      }
    }catch(error){
        res.json({
          success : false,
          response : error
        })
    }
  }


  //Fonction pour la generation des cle p our la 2FA
  static async setup2FA(req, res) {
      try {
          const userId = req.user.id; 
          const user = await prisma.user.findUnique({ where: { id: userId } });

          // Générer le secret et l'URL
          const { secret, otpauthUrl } = TwoFactorService.generateSecretKey(user.email);

          //  Enregistrer le secret temporairement dans le profil de l'user
          await prisma.user.update({
              where: { id: userId },
              data: { twoFactorSecret: secret }
          });

          //  Envoyer au front (le front générera le QR Code avec l'URL)
          return res.json({
              success: true,
              otpauthUrl, 
              secret     
          });

      } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
      }
  }

  //Fonction pour la desactivation de la TwoFa
  static async disable(req, res){
    try{
        const userId = req.user.id;

        const {code} = req.body;
        await TwoFactorService.verifyOtp(code);

        await TwoFactorService.desable(userId);

        return res.json({
          success : true,
          response : "La double authentification a été désactivée avec succès."
        });
    }catch(error){
      res.status(error.status || 500).json({
        success : false,
        response : error.message || "Une erreur est survenue lors de la desactivation"
      })
    }
  }


  //Fonction pour le logout
  static async logout(req, res){
    //Recuperation de l'accessToken dans le cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            message: "Aucun cookie trouvé, session expirée." 
        });
    }

    try{
      //Decoder l'accesstoken afin de recuperer l'id de l'utilisateur 
      const secret  = new TextEncoder().encode(process.env.JWT_SECRET);

      if(refreshToken){
        //Verification et decodage du token
        const payload = decodeJwt(refreshToken)
  
        //Recuperation de l'id de l'utilisateur
        const userId = payload.sub;
  
        //Suppression du token dans la table session 
        await prisma.session.deleteMany({where : {userId : userId}})
  
        }

    }catch(error){
        // Même en cas d'erreur (ex: session déjà supprimée), 
        // on veut que l'utilisateur soit déconnecté visuellement
        res.clearCookie('refreshToken');
        return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
    }finally{ 
        //suppression des tokens des cookies
        res.clearCookie('refreshToken', {
          httpOnly : true,
          secure : process.env.NODE_ENV === 'production',
          sameSite : 'strict',
          path : '/'
        });

        return res.json({
          success : true,
          response : "Deconnexion réussie"
        });
    }
  }

  //Fonction pour le refreshToken
  static async refresh(req, res) {
      try {
          // Récupérer le RefreshToken depuis les cookies
          const refreshToken = req.cookies.refreshToken;

          if (!refreshToken) throw new Error("Non authentifié");

          // Vérifier le token et trouver la session en BDD
          const payload = await verifyToken(refreshToken);
          const session = await prisma.session.findUnique({
              where: { refreshToken },
              include: { user: true }
          });

          if (!session || session.expirates < new Date()) {
              throw new Error("Session expirée");
          }

          // Générer un nouvel AccessToken
          // On peut aussi faire une "Rotation" du RefreshToken ici pour plus de sécurité
          const newAccessToken = await signToken({ sub: session.userId, isFullAuth: true }, '15m');
          const newRefreshToken = await signToken({ sub: session.userId }, '7d');

          //  Mettre à jour la session en BDD (Rotation)
          await prisma.session.update({
              where: { id: session.id },
              data: { refreshToken: newRefreshToken }
          });

          // Renvoyer le nouveau RefreshToken dans le cookie et l'Access en JSON
          res.cookie('refreshToken', newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production', 
              sameSite: 'Strict',
              maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
          });

          return res.json({ accessToken: newAccessToken });

      } catch (error) {
          return res.status(401).json({ message: "Veuillez vous reconnecter" });
      }
  }

  static async getAll(req, res) {
    const users = await UserService.findAll();
    res.json({
      success: true,
      users: UserDto.transform(users),
    });
  }

  static async revokeSession(req, res){
    const {idSession} = req.params;
    const userId = req.user.id;
    try {
        await UserService.RevokeSession(userId, idSession);
        
        return res.json({
            success: true,
            response: "Session spécifique supprimée avec succès"
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
  }
  
  static async revokeAllSession(req, res){
    const userId = req.user.id;

    try {
        await UserService.RevokeAllSession(userId);
        
        // On peut aussi vider le cookie de l'utilisateur actuel
        res.clearCookie('accessToken');
        
        return res.json({
            success: true,
            response: "Toutes les sessions ont été révoquées"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
  }

  
  static async getAllSection(req, res){
    const userId = req.user.id;
    try{
      const userSession = await UserService.getAllSection(userId);
  
      if(userSession.success == true){
        return res.json({
          success : true,
          response : userSession.response
        })
      }
    }catch(error){
      return res.json({
        success : false,
        response : error
      })
    }
  }

  //Fonction pour la recherche d'un utilisateur specifique
  static async getById(req, res) {
    const user = await UserService.findById(parseInt(req.params.id));
    res.json({
      success: true,
      user: UserDto.transform(user),
    });
  }

  //Fonction pour le profile utilisateur
  static async UserProfile(req, res){
      const userId = req.user.id; 
      try{
          const user = await UserService.findById(parseInt(userId));
          res.json({
            success: true,
            user: UserDto.transform(user),
          });
      }catch(error){
        res.json({
          success : false,
          response : error
        })
      }
  }

  //Fonction pour la mise a jour du profile
  static async UpdateProfile(req, res){
    const userId = req.user.id;
    const validatedData = validateData(registerSchema, req.body);

    try{
       const saveData = await UserService.updateProfile(userId,validatedData);
       if(saveData.success == true){
        return res.status(200).json({
          success : true,
          response : "Profile mis a jour avec success"
        })
       }
    }catch(error){
        return res.json({
          success : false,
          response : error
        })
    }
  }
  
  static async getAll(req, res) {
    const users = await UserService.findAll();
    res.json({
      success: true,
      users: UserDto.transform(users),
    });
  }
}

  