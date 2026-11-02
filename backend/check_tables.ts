import { prisma } from './src/db/client.js';
const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
console.log(JSON.stringify(tables, null, 2));
await prisma.$disconnect();
