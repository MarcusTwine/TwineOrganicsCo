'use client'

import { useActionState, useEffect, useRef } from 'react'
import { updateCustomer, type CustomerUpdateState } from '../actions'

type Customer = {
  id: string
  name: string
  email: string
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

const initial: CustomerUpdateState = { error: '', success: false }

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  defaultValue: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-forest focus:outline-none"
      />
    </div>
  )
}

export default function EditCustomerModal({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  const boundAction = updateCustomer.bind(null, customer.id)
  const [state, action, pending] = useActionState(boundAction, initial)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 800)
      return () => clearTimeout(t)
    }
  }, [state.success, onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={dialogRef} className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit customer</h2>
            <p className="text-xs text-gray-400 mt-0.5">{customer.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action}>
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {state.error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </p>
            )}
            {state.success && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Customer updated.
              </p>
            )}

            {/* Personal */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Personal</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full name" name="name" defaultValue={customer.name} required />
                <Field label="Email address" name="email" type="email" defaultValue={customer.email} required autoComplete="off" />
              </div>
              <div className="mt-4">
                <Field label="Phone number" name="phone" type="tel" defaultValue={customer.phone ?? ''} />
              </div>
            </div>

            {/* Delivery address */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Delivery address</p>
              <div className="space-y-3">
                <Field label="Address line 1" name="addressLine1" defaultValue={customer.addressLine1 ?? ''} autoComplete="off" />
                <Field label="Address line 2" name="addressLine2" defaultValue={customer.addressLine2 ?? ''} autoComplete="off" />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="City" name="city" defaultValue={customer.city ?? ''} />
                  <Field label="Province" name="province" defaultValue={customer.province ?? ''} />
                  <Field label="Postal code" name="postalCode" defaultValue={customer.postalCode ?? ''} />
                </div>
              </div>
            </div>

            {/* Billing address */}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Billing address</p>
              <p className="mb-3 text-xs text-gray-400">Leave blank to use delivery address for billing.</p>
              <div className="space-y-3">
                <Field label="Address line 1" name="billingAddressLine1" defaultValue={customer.billingAddressLine1 ?? ''} autoComplete="off" />
                <Field label="Address line 2" name="billingAddressLine2" defaultValue={customer.billingAddressLine2 ?? ''} autoComplete="off" />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="City" name="billingCity" defaultValue={customer.billingCity ?? ''} />
                  <Field label="Province" name="billingProvince" defaultValue={customer.billingProvince ?? ''} />
                  <Field label="Postal code" name="billingPostalCode" defaultValue={customer.billingPostalCode ?? ''} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || state.success}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
