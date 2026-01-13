import argon2 from "argon2";

/**
 * Cette fonction prend en parametre un mot de passe et procède à son hashage avec Argon2 
 */
export async function hashPassword(password) {
  return argon2.hash(password);
}

/**
 * Cette fonction prend en parametre le mot de passe en bruite et le mot de passe hashé puis verifie s'ils corresponds
 */
export async function verifyPassword(hash, password){
  return argon2.verify(hash, password);
}