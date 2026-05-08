import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/hash'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        })
        if (!user) return null

        const valid = await verifyPassword(
          credentials.password as string,
          user.hashedPassword,
        )
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
})

// Safe wrapper for use in Server Actions.
// Auth.js v5 can throw JWTSessionError when a cookie was signed with a
// different secret (e.g. after a server redeploy). We treat that as "no session"
// so actions return "Forbidden" cleanly instead of crashing with 500.
export async function getSession() {
  try {
    return await auth()
  } catch {
    return null
  }
}
