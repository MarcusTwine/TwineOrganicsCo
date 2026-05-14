import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { db } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'

const EXPIRY_MINUTES = 15

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const raw = body?.email
  const next = typeof body?.next === 'string' ? body.next : '/account'

  if (typeof raw !== 'string' || !raw.includes('@')) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const email = raw.toLowerCase().trim()

  // Always return 200 — never reveal whether an account exists
  try {
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      // Auto-create account on first login — no password needed
      user = await db.user.create({
        data: { name: email.split('@')[0], email, role: 'CUSTOMER' },
      })
    }

    // Clean up expired tokens for this user
    await db.magicLinkToken.deleteMany({
      where: { userId: user.id, usedAt: null, expiresAt: { lt: new Date() } },
    })

    const plain     = randomBytes(32).toString('hex')
    const hash      = createHash('sha256').update(plain).digest('hex')
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60_000)

    await db.magicLinkToken.create({
      data: { userId: user.id, token: hash, expiresAt },
    })

    const siteUrl   = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const magicLink = `${siteUrl}/account/verify?token=${plain}&next=${encodeURIComponent(next)}`

    await sendMagicLinkEmail(email, magicLink)
  } catch (err) {
    console.error('[magic-link]', err)
    // Still return 200 so callers show "check your email" regardless
  }

  return NextResponse.json({ ok: true })
}
