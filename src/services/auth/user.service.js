import prisma from "#lib/prisma";
import {  hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";


export class UserService {
  static async register(data) {
    const { email, firstname, lastname, password, avatarUrl} = data;

    //Verification si les données ont bien été reçu
    if(!email || !firstname || !lastname || !password || !avatarUrl){
      throw new NotFoundException("Donnée non reçus");
    }

    //Verification si l'utilisateur existe deja dans la base de donnée(unicité de l'utilisateur)
    const verifyuser =await prisma.user.findUnique({where: {
      email : email
    }});

    if(verifyuser){
      throw new ConflictException('l\'Utilisateur existe dejà');
    }

    //Hashage du mot de passe
    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data : {
        email : email,
        firstname : firstname,
        lastname : lastname,
        password : passwordHash,
        avatarUrl : avatarUrl
      }
    })

    return user;
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
