import prisma from "#lib/prisma";
import {  hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";


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

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    return user;
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