'use server'

import { auth } from '@/lib/auth'
import { setSettings } from '@/lib/settings'
import { revalidatePath } from 'next/cache'

export async function savePaymentSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Forbidden')

  const entries: Record<string, string> = {}

  for (const key of ['peach_base_url', 'peach_entity_id', 'peach_access_token']) {
    const value = formData.get(key)
    if (typeof value === 'string') {
      entries[key] = value.trim()
    }
  }

  await setSettings(entries)
  revalidatePath('/admin/settings')
}
