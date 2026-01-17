import { UserService } from "#services/auth/user.service";
import { UserDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";
import { loginSchema } from "#schemas/auth/login.schema";
import { OtpService } from "#services/auth/otp.service";

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
    const validatedData = validateData(loginSchema, req.body);
    const { email, password } = validatedData;
    
    try{
        //Recuperation du userAgent bruite
        const useragent = req.headers['user-agent'] || '';
    
        // l'ip
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; 

        //Donnée restante
        const data = {
            userAgent : useragent,
            ipAdress : ip,
        }
        
        const user = await UserService.login(email, password, data);
    
        return res.json({
          success: true,
          user : user,
          userAgent : data.userAgent,
          ipAdress : data.ipAdress,
          response : "Login Successfully"
        });
    }catch(error){
      console.error("Erreur lors du register:", error);
    
      return res.status(error.status || 500).json({
        success: false,
        response: error.message || "Une erreur est survenue lors de l'inscription.",
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
