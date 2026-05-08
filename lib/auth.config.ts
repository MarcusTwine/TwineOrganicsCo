import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config — no Prisma, no Node.js native modules.
// Used by middleware. The full config (with Credentials provider) is in auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: 'CUSTOMER' | 'ADMIN' }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'CUSTOMER' | 'ADMIN'
      return session
    },
  },
  pages: {
    signIn: '/account/login',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
}
