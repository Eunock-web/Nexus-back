import { UserService } from "#services/auth/user.service";
import { UserDto } from "#dto/user.dto";
import { signToken } from "#lib/jwt";
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";
import { loginSchema } from "#schemas/auth/login.schema";
import { OtpService } from "#services/auth/otp.service";

export class UserController {
  static async register(req, res) {
    const validatedData = validateData(registerSchema, req.body);
    const user = await UserService.register(validatedData);

    const EmailData = await OtpService.SaveOtp(user.email);
    await OtpService.SendOtpEmail(user.email, EmailData.codeOtp, EmailData.expireTime);

    res.status(201).json({
      success: true,
      response : "Inscription éffectué avec succes",
      user: UserDto.transform(user),
    });
  }

  static async login(req, res) {
    const validatedData = validateData(loginSchema, req.body);
    const { email, password } = validatedData;

    const user = await UserService.login(email, password);
    const token = await signToken({ userId: user.id });

    res.statuts(201).json({
      success: true,
      user: UserDto.transform(user),
      token,
    });
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
