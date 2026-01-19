import prisma from "#lib/prisma";
import {  hashPassword } from "#lib/password";
import { ConflictException, NotFoundException } from "#lib/exceptions";
import { OtpService } from "./otp.service.js";


export class UserService {

  
  static async register(data) {

    //Verification si les données ont bien été reçu
    if(!data){
      throw new NotFoundException("Donnée non reçus");
    }

    //Recupeation des données
    const { email, firstname, lastname, password, avatarUrl} = data;

    try{
      //Verification si l'utilisateur existe deja dans la base de donnée(unicité de l'utilisateur)
      const verifyuser =await prisma.user.findUnique({where: {
        email : email
      }});
      if(verifyuser){
        throw new ConflictException('l\'Utilisateur existe dejà');
      }

      //Hashage du mot de passe
      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data : {
          email ,
          firstname,
          lastname ,
          password : passwordHash,
          avatarUrl
        }
      });

      return user;

    }catch(error){
      // Gestion des erreurs Prisma (ex: email déjà existant)
      if (error.code === 'P2002') {
        throw new Error("Cet email est déjà utilisé");
      }
      throw error;
    }
  }

  
  /**
   * Cette fonction se charge de modifier le mot de passe de l'utilisateur apres que celui ci ai validé le forgotPassword
   */
  static async updatePassword(email, password){
    //Rechercher l'utilisateur en fonctiond de son mail
    const user = await prisma.user.findUnique({where : {email : email}});

    if(!user){
       throw new NotFoundException("Utilisateur innexistant");
    }

    //Hachage du mot de passe
    const passwordHash = await hashPassword(password);


    if(email == user.email){
      await prisma.user.update({
        where : email,
        data : {
          password : passwordHash
        }
      })

      return {
        success : true
      }
    }else{
      return {
        success : false
      }
    }
  }


  static async findAll() {
    return prisma.user.findMany();
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }
}