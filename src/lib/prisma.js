import "dotenv/config";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Récupération de la chaîne de connexion depuis le .env
const connectionString = process.env.DATABASE_URL;

// Configuration du Pool PostgreSQL (le moteur de connexion)
const pool = new pg.Pool({ connectionString });

//  Création de l'adaptateur Prisma spécifique à Postgres
const adapter = new PrismaPg(pool);

// Initialisation du PrismaClient avec l'adaptateur
// Utilisation d'un pattern "Singleton" pour éviter de saturer les connexions en dev
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;