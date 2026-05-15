'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export type ProfileState = { error: string; success: boolean }

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated', success: false }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required', success: false }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone:               (formData.get('phone') as string)?.trim() || null,
      addressLine1:        (formData.get('addressLine1') as string)?.trim() || null,
      addressLine2:        (formData.get('addressLine2') as string)?.trim() || null,
      city:                (formData.get('city') as string)?.trim() || null,
      province:            (formData.get('province') as string)?.trim() || null,
      postalCode:          (formData.get('postalCode') as string)?.trim() || null,
      billingAddressLine1: (formData.get('billingAddressLine1') as string)?.trim() || null,
      billingAddressLine2: (formData.get('billingAddressLine2') as string)?.trim() || null,
      billingCity:         (formData.get('billingCity') as string)?.trim() || null,
      billingProvince:     (formData.get('billingProvince') as string)?.trim() || null,
      billingPostalCode:   (formData.get('billingPostalCode') as string)?.trim() || null,
    },
  })

  revalidatePath('/account/profile')
  return { error: '', success: true }
}
