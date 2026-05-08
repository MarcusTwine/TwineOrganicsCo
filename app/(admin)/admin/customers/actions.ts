'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export async function setSubscriptionStatus(
  email: string,
  active: boolean,
): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  await db.newsletterSubscription.upsert({
    where: { email },
    create: { email, active },
    update: { active },
  })

  revalidatePath('/admin/customers')
  return { error: '', success: true }
}
