import { validateData } from "#lib/validate";
import { OtpSchema } from "#schemas/auth/otp.schema";
import { OtpService } from "#services/auth/otp.service";



export class OtpController{

    static async VerifyEmail(req, res){
        try{
            const validatedData = validateData(OtpSchema, req.body);
            console.log(validatedData)
            const email = String(validatedData.email)
            const code = String(validatedData.code) 

            const result = await OtpService.VerifyEmail(email, code);
            if(result.success == true){
                return res.json({
                    success : true,
                    message: "Votre compte a été validé avec succès."
                })
            }
        }catch (error) {
            return res.status(error.status || 400).json({
                success: false,
                message: error.message || "Erreur de validation"
            });
         }
    }

}