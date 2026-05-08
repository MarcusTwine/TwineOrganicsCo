/**
 * Prisma database client singleton for Next.js.
 *
 * NOTE FOR DEV TEAM:
 * Before using this client, ensure you have a PostgreSQL database running and
 * have set DATABASE_URL in your .env.local file, then run:
 *
 *   npx prisma migrate dev --name init
 *
 * Prisma v7 uses driver adapters — the connection URL is passed directly to
 * PrismaPg rather than being declared in schema.prisma.
 */

import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL ?? ''

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
