import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  let email: string | undefined
  try {
    const body = await req.json()
    email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  await db.newsletterSubscription.upsert({
    where: { email },
    create: { email },
    update: { active: true },
  })

  return NextResponse.json({ success: true })
}
