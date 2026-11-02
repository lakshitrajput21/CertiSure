import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[DB] Warning: DATABASE_URL is not set. Database operations will fail until configured.');
}

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/certisure_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB] PostgreSQL connected successfully via PrismaPg adapter.');
    return true;
  } catch (error) {
    console.error('[DB] Failed to connect to PostgreSQL:', error instanceof Error ? error.message : error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log('[DB] Disconnected from database.');
  } catch (error) {
    console.error('[DB] Error disconnecting database:', error);
  }
}
