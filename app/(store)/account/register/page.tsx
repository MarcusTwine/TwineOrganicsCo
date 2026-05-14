'use client'

import { redirect } from 'next/navigation'

// Registration is no longer a separate step — entering your email on the
// sign-in page automatically creates an account if one doesn't exist yet.
export default function RegisterPage() {
  redirect('/account/login')
}
