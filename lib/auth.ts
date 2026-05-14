import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import { db } from '@/lib/db'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { token: { type: 'text' } },
      async authorize(credentials) {
        const plain = credentials?.token
        if (typeof plain !== 'string' || !plain) return null

        const hash = createHash('sha256').update(plain).digest('hex')

        const record = await db.magicLinkToken.findUnique({
          where: { token: hash },
          include: { user: true },
        })

        if (!record)              return null
        if (record.usedAt)        return null
        if (record.expiresAt < new Date()) return null

        // Single-use — mark consumed immediately
        await db.magicLinkToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        })

        return {
          id:    record.user.id,
          name:  record.user.name,
          email: record.user.email,
          role:  record.user.role,
        }
      },
    }),
  ],
})

// Safe wrapper: swallows JWTSessionError (mismatched secret after redeploy)
export async function getSession() {
  try {
    return await auth()
  } catch {
    return null
  }
}
