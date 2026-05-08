import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/hash'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json(
      { error: 'Name, email, and password are required.' },
      { status: 400 },
    )
  }

  const { name, email, password } = body as {
    name: string
    email: string
    password: string
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 },
    )
  }

  const hashedPassword = await hashPassword(password)
  await db.user.create({
    data: { name, email, hashedPassword, role: 'CUSTOMER' },
  })

  return NextResponse.json({ message: 'Account created.' }, { status: 201 })
}
