// Remplace l'ancien chemin par '@prisma/client'
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

// Configuration de la connexion PostgreSQL
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Utilisation du Singleton pour éviter de multiplier les connexions
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;