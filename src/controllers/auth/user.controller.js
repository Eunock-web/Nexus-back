import { UserService } from "#services/auth/user.service";
import { UserDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";
import { OtpService } from "#services/auth/otp.service";
import prisma from "#lib/prisma";
import { NotFoundException } from "#lib/exceptions";

export class UserController {

  static async register(req, res) {
    try{
        const validatedData = validateData(registerSchema, req.body);
        console.log(validatedData);
        const user = await UserService.register(validatedData);
    
        const EmailData = await OtpService.SaveOtp(user.email);
        await OtpService.SendOtpEmail(user.email, EmailData.codeOtp, EmailData.expireTime);
    
        res.status(201).json({
          success: true,
          email :  user.email,
          response : "Inscription éffectué avec succes",
          user: UserDto.transform(user),
        });
    }catch(error){
      console.error("Erreur lors du register:", error);
    
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Une erreur est survenue lors de l'inscription.",
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
      const { email, password } = req.body;

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
          response : error.message
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

  static async getById(req, res) {
    const user = await UserService.findById(parseInt(req.params.id));
    res.json({
      success: true,
      user: UserDto.transform(user),
    });
  }
}
