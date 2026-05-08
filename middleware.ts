import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  // Admin routes — must be ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/account/login', req.url))
    }
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Protected customer routes — must be logged in
  const protectedCustomerPaths = ['/account/orders', '/account/profile', '/checkout']
  if (protectedCustomerPaths.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/account/login', req.url))
  }
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/orders/:path*',
    '/account/profile/:path*',
    '/checkout',
  ],
}
