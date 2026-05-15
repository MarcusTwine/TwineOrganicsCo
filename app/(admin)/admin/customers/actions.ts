'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export type ImportRow = {
  name: string
  email: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  province?: string
  postalCode?: string
  billingAddressLine1?: string
  billingAddressLine2?: string
  billingCity?: string
  billingProvince?: string
  billingPostalCode?: string
  newsletter?: string
}

export type ImportResult = {
  created: number
  skipped: number
  subscribed: number
  errors: string[]
}

export async function importCustomers(rows: ImportRow[]): Promise<ImportResult> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') {
    return { created: 0, skipped: 0, subscribed: 0, errors: ['Forbidden'] }
  }

  let created = 0
  let skipped = 0
  let subscribed = 0
  const errors: string[] = []

  for (const row of rows) {
    const email = row.email.trim().toLowerCase()
    const name = row.name.trim()
    if (!email || !name) {
      errors.push(`Skipped row with missing name or email: "${row.email}"`)
      continue
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      skipped++
    } else {
      try {
        await db.user.create({
          data: {
            name,
            email,
            role: 'CUSTOMER',
            phone:               row.phone?.trim() || null,
            addressLine1:        row.addressLine1?.trim() || null,
            addressLine2:        row.addressLine2?.trim() || null,
            city:                row.city?.trim() || null,
            province:            row.province?.trim() || null,
            postalCode:          row.postalCode?.trim() || null,
            billingAddressLine1: row.billingAddressLine1?.trim() || null,
            billingAddressLine2: row.billingAddressLine2?.trim() || null,
            billingCity:         row.billingCity?.trim() || null,
            billingProvince:     row.billingProvince?.trim() || null,
            billingPostalCode:   row.billingPostalCode?.trim() || null,
          },
        })
        created++
      } catch {
        errors.push(`Failed to create user ${email}`)
        continue
      }
    }

    const wantsNewsletter = /^(yes|true|1)$/i.test((row.newsletter ?? '').trim())
    if (wantsNewsletter) {
      await db.newsletterSubscription.upsert({
        where: { email },
        create: { email, active: true },
        update: { active: true },
      })
      subscribed++
    }
  }

  revalidatePath('/admin/customers')
  return { created, skipped, subscribed, errors }
}

export type CustomerUpdateState = { error: string; success: boolean }

export async function updateCustomer(
  id: string,
  _prev: CustomerUpdateState,
  formData: FormData,
): Promise<CustomerUpdateState> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!name) return { error: 'Name is required', success: false }
  if (!email) return { error: 'Email is required', success: false }

  const conflict = await db.user.findFirst({ where: { email, NOT: { id } } })
  if (conflict) return { error: 'That email is already in use by another account', success: false }

  await db.user.update({
    where: { id },
    data: {
      name,
      email,
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

  revalidatePath('/admin/customers')
  return { error: '', success: true }
}

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
