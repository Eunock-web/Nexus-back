import { UserService } from "#services/auth/user.service";
import { UserDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";
import { loginSchema } from "#schemas/auth/login.schema";
import { OtpService } from "#services/auth/otp.service";
import prisma from "#lib/prisma";

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
        response: error.message || "Une erreur est survenue lors de l'inscription.",
      });
    }
  }

  //Fonction de Login
  static async login(req, res) {
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
          res.cookie('accessToken', result.accessToken, cookieOptions);

          return res.json({
              success: true,
              message: "Connexion réussie",
              refreshToken: result.refreshToken 
          });

      } catch (error) {
          return res.status(error.status || 500).json({ 
              success: false, 
              message: error
          });
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
