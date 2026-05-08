import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/hash'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email) {
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  }

  const user = await db.user.findUnique({ where: { email: body.email } })
  // Always return 200 to prevent email enumeration
  if (!user) {
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  }

  const plainToken = randomBytes(32).toString('hex')
  const hashedToken = await hashPassword(plainToken)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await db.passwordResetToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/account/reset-password/${plainToken}`
  await sendPasswordResetEmail(user.email, resetUrl)

  return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
}
