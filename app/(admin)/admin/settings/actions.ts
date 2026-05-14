'use server'

import { auth } from '@/lib/auth'
import { setSettings } from '@/lib/settings'
import { revalidatePath } from 'next/cache'

export async function savePaymentSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Forbidden')

  const entries: Record<string, string> = {}

  for (const key of ['peach_base_url', 'peach_entity_id', 'peach_client_id', 'peach_client_secret', 'peach_merchant_id']) {
    const value = formData.get(key)
    if (typeof value === 'string') {
      entries[key] = value.trim()
    }
  }

  await setSettings(entries)
  revalidatePath('/admin/settings')
}

export async function saveSmtpSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Forbidden')

  const entries: Record<string, string> = {}

  for (const key of ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_name', 'smtp_from_email']) {
    const value = formData.get(key)
    if (typeof value === 'string') {
      entries[key] = value.trim()
    }
  }

  // Checkbox — present in FormData only when checked
  entries['smtp_secure'] = formData.get('smtp_secure') === 'true' ? 'true' : 'false'

  await setSettings(entries)
  revalidatePath('/admin/settings')
}
