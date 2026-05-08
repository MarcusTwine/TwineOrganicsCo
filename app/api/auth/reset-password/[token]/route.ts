import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/hash'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: plainToken } = await params
  const body = await req.json().catch(() => null)

  if (!body?.password || body.password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 },
    )
  }

  // Find tokens that haven't been used and haven't expired
  const now = new Date()
  const tokens = await db.passwordResetToken.findMany({
    where: { usedAt: null, expiresAt: { gt: now } },
    take: 20,
  })

  // Find the token whose hash matches the plain token
  let matchedToken = null
  for (const t of tokens) {
    const matches = await verifyPassword(plainToken, t.token)
    if (matches) { matchedToken = t; break }
  }

  if (!matchedToken) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired.' },
      { status: 400 },
    )
  }

  const hashedPassword = await hashPassword(body.password)

  await Promise.all([
    db.user.update({
      where: { id: matchedToken.userId },
      data: { hashedPassword },
    }),
    db.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: now },
    }),
  ])

  return NextResponse.json({ message: 'Password updated successfully.' })
}
