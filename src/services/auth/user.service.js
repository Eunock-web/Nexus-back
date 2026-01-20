import prisma from "#lib/prisma";
import {  hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { signToken } from "#lib/jwt";


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

  static async login(email, password, meta) {
      const user = await prisma.user.findUnique({ where: { email } });
      
      // Vérification sécurité de base
      if (!user) throw new UnauthorizedException("Identifiants invalides");

      const passwordConfirmation = await verifyPassword(user.password, password);
      if (!passwordConfirmation) throw new UnauthorizedException("Identifiants invalides");

      // CAS 2FA : Si activé, on génère juste un token temporaire
      if (user.twoFactorEnable) {
          // Token jose avec un flag "type: mfa" valide 5 minutes
          const mfaToken = await signToken({ sub: user.id, type: 'mfa' }, '5m');
          return { requires2FA: true, mfaToken };
      }
    
      // CAS NORMAL : On génère la session et les tokens finaux
      return await this.finalizeLogin(user, meta);
  }

  // Fonction utilitaire pour éviter la répétition (sera aussi utilisée par verify2FA)
  static async finalizeLogin(user, meta) {
      const refreshToken = await signToken({ sub: user.id }, '7d');
      const accessToken = await signToken({ sub: user.id }, '15m');
      const expirateAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.create({
          data: {
              userId: user.id,
              refreshToken: refreshToken,
              userAgent: meta.userAgent,
              ipAddress: meta.ipAddress,
              expirates: expirateAt
          }
      });

      return { accessToken, refreshToken };
  }

  
  /**
   * Cette fonction se charge de modifier le mot de passe de l'utilisateur apres que celui ci ai validé le forgotPassword
   */
  static async updatePassword(email, password){
    //Rechercher l'utilisateur en fonction de son mail
    const user = await prisma.user.findUnique({where : {email : email}});

    if(!user){
       throw new NotFoundException("Utilisateur innexistant");
    }

    //Hachage du mot de passe
    const passwordHash = await hashPassword(password);


    if(email == user.email){
      await prisma.user.update({
        where : {email : email},
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

  /**
   * 
   * @param {*} email 
   */
  static async RevokeAllSession(userid){
    //Suppression de toutes les sessions en rapport avec l'userId donnée
    await prisma.session.deleteMany({where : {userId : userid}})

    return {
      success : true
    }

  }

  static async RevokeSession(userid, sessionId){
    //Suppression de toutes les sessions de l'utilisateur en fonction de l'id de session

    const sessiondel = await prisma.session.deleteMany({where : {id : sessionId, userId : userid}})
    if(!sessiondel.count == 0){
       throw new NotFoundException("Session introuvable");
    }

    return {
      success : true
    }

  }

  static async getAllSection(userId){
    const userSession = await prisma.session.findMany({where : 
      {userId : userId},
      select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true 
        }
    });

    return {
      success : true,
      response : userSession
    }
  }


  static async findAll() {
    return prisma.user.findMany();
  }

  //Fonction pour la recherche d'un utilisateur specifique (peut etre utilise pour le profile de l'utilisateur)
  static async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }
  
  //Fonction pour modifier les informations d'un utilisateur
  static async updateProfile(userId, data){

    const {email, firstname, lastname, password, avatarUrl} = data  

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where : {id: userId},
      data : {
        email,
        firstname,
        lastname,
        password : passwordHash,
        avatarUrl
      }
    })    

    return {
      success : true
    }
  }
}

