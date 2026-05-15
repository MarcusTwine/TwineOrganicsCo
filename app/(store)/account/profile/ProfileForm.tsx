'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileState } from './actions'

type ProfileData = {
  name: string
  email: string
  role: string
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  billingAddressLine1: string | null
  billingAddressLine2: string | null
  billingCity: string | null
  billingProvince: string | null
  billingPostalCode: string | null
}

const initial: ProfileState = { error: '', success: false }

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, action, pending] = useActionState(updateProfile, initial)

  const initial_char = profile.name[0]?.toUpperCase() ?? '?'

  return (
    <form action={action} className="space-y-6">
      {/* Avatar strip */}
      <div className="flex items-center gap-5 rounded-2xl border border-[#E8E3D9] bg-white px-6 py-5">
        <div className="w-16 h-16 rounded-full bg-[#1A3526] flex items-center justify-center shrink-0">
          <span className="font-serif text-2xl text-white font-semibold leading-none">{initial_char}</span>
        </div>
        <div>
          <p className="font-semibold text-[#1A1A18]">{profile.name}</p>
          <p className="text-sm text-[#6B6B65] mt-0.5">{profile.email}</p>
          <span className="inline-block mt-2 rounded-full bg-[#1A3526]/8 px-2.5 py-0.5 text-[11px] font-medium text-[#1A3526] capitalize">
            {profile.role.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Feedback */}
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profile updated.
        </p>
      )}

      {/* Personal details */}
      <section className="rounded-2xl border border-[#E8E3D9] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3D9]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9A9A94]">Personal details</h2>
        </div>
        <div className="divide-y divide-[#E8E3D9]">
          <Field label="Full name" name="name" defaultValue={profile.name} required />
          <Field label="Email address" name="email" defaultValue={profile.email} disabled />
          <Field label="Phone number" name="phone" type="tel" defaultValue={profile.phone ?? ''} />
        </div>
      </section>

      {/* Delivery address */}
      <section className="rounded-2xl border border-[#E8E3D9] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3D9]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9A9A94]">Delivery address</h2>
          <p className="mt-0.5 text-xs text-[#9A9A94]">Pre-filled at checkout.</p>
        </div>
        <div className="divide-y divide-[#E8E3D9]">
          <Field label="Address line 1" name="addressLine1" autoComplete="street-address" defaultValue={profile.addressLine1 ?? ''} />
          <Field label="Address line 2" name="addressLine2" autoComplete="address-line2" defaultValue={profile.addressLine2 ?? ''} />
          <Field label="City" name="city" autoComplete="address-level2" defaultValue={profile.city ?? ''} />
          <Field label="Province" name="province" autoComplete="address-level1" defaultValue={profile.province ?? ''} />
          <Field label="Postal code" name="postalCode" autoComplete="postal-code" defaultValue={profile.postalCode ?? ''} />
        </div>
      </section>

      {/* Billing address */}
      <section className="rounded-2xl border border-[#E8E3D9] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3D9]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9A9A94]">Billing address</h2>
          <p className="mt-0.5 text-xs text-[#9A9A94]">Leave blank to use your delivery address for billing.</p>
        </div>
        <div className="divide-y divide-[#E8E3D9]">
          <Field label="Address line 1" name="billingAddressLine1" autoComplete="billing street-address" defaultValue={profile.billingAddressLine1 ?? ''} />
          <Field label="Address line 2" name="billingAddressLine2" autoComplete="billing address-line2" defaultValue={profile.billingAddressLine2 ?? ''} />
          <Field label="City" name="billingCity" autoComplete="billing address-level2" defaultValue={profile.billingCity ?? ''} />
          <Field label="Province" name="billingProvince" autoComplete="billing address-level1" defaultValue={profile.billingProvince ?? ''} />
          <Field label="Postal code" name="billingPostalCode" autoComplete="billing postal-code" defaultValue={profile.billingPostalCode ?? ''} />
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#1A3526] px-6 py-3 text-sm font-medium text-white hover:bg-[#2D5A3D] transition-colors disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  disabled,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  defaultValue: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <label htmlFor={name} className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-[#9A9A94]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="flex-1 rounded-lg border border-[#E8E3D9] bg-white px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1A3526] focus:outline-none disabled:bg-[#F8F7F4] disabled:text-[#9A9A94]"
      />
    </div>
  )
}
