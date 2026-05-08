import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const db = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@twineorganics.co.za'
  const password = process.env.ADMIN_PASSWORD ?? 'changeme123'

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await db.user.create({
    data: { name: 'Admin', email, hashedPassword, role: 'ADMIN' },
  })
  console.log(`Admin user created: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
