/**
 * Ce fichier est chargé de la generation  du code pour  l'envoi de l'otp pour la validation de l'email
 */
import crypto from 'crypto'

export async function generateOtp(){
   return  crypto.randomInt(100000, 999999).toString();
}