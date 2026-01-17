import { SignJWT, jwtVerify } from "jose";
import crypto from 'crypto';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = "HS256";

//Fonction de generation de token
export async function signToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}


//Fonction de verification de token
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}


/**
 * Génère une clé secrète sécurisée pour JWT
 */
export const generateJwtSecret = () => {
    return crypto.randomBytes(64).toString('hex');
};

