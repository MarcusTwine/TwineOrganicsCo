import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'
import { savePaymentSettings, saveSmtpSettings } from './actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const keys = [
    'peach_base_url', 'peach_entity_id',
    'peach_client_id', 'peach_client_secret', 'peach_merchant_id',
    'smtp_host', 'smtp_port', 'smtp_secure',
    'smtp_user', 'smtp_pass', 'smtp_from_name', 'smtp_from_email',
  ]
  const s = await getSettings(keys)

  const peachConfigured = !!(
    (s.peach_base_url     || process.env.PEACH_BASE_URL) &&
    (s.peach_entity_id    || process.env.PEACH_ENTITY_ID) &&
    (s.peach_client_id    || process.env.PEACH_CLIENT_ID) &&
    (s.peach_client_secret || process.env.PEACH_CLIENT_SECRET) &&
    (s.peach_merchant_id  || process.env.PEACH_MERCHANT_ID)
  )
  const smtpConfigured = !!(s.smtp_host && s.smtp_user && s.smtp_pass)

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Values saved here override environment variables.
        </p>
      </div>

      {/* ── Peach Payments ───────────────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Peach Payments</h2>
            <p className="text-sm text-gray-500">
              Card checkout credentials. Get them from your{' '}
              <a href="https://merchant.peachpayments.com" target="_blank" rel="noopener noreferrer"
                 className="text-green-700 hover:underline">
                Peach merchant dashboard
              </a>.
            </p>
          </div>
          <Badge configured={peachConfigured} />
        </div>

        <form action={savePaymentSettings} className="space-y-5 px-6 py-5">
          <Field
            id="peach_base_url" name="peach_base_url" label="Base URL" type="url"
            hint="Sandbox: https://testsecure.peachpayments.com  ·  Production: https://secure.peachpayments.com"
            placeholder="https://testsecure.peachpayments.com"
            defaultValue={s.peach_base_url ?? process.env.PEACH_BASE_URL ?? ''}
          />
          <Field
            id="peach_entity_id" name="peach_entity_id" label="Entity ID"
            hint="Channels → Entity ID in your Peach dashboard"
            placeholder="8a8294174b7ecb28014b9699220015ca"
            defaultValue={s.peach_entity_id ?? process.env.PEACH_ENTITY_ID ?? ''}
          />
          <Field
            id="peach_client_id" name="peach_client_id" label="Client ID"
            hint="Embedded Checkout → Client ID in your Peach dashboard"
            placeholder="abc123..."
            defaultValue={s.peach_client_id ?? process.env.PEACH_CLIENT_ID ?? ''}
          />
          <Field
            id="peach_client_secret" name="peach_client_secret" label="Client Secret"
            hint="Embedded Checkout → Client secret in your Peach dashboard"
            placeholder="••••••••"
            defaultValue={s.peach_client_secret ?? process.env.PEACH_CLIENT_SECRET ?? ''}
          />
          <Field
            id="peach_merchant_id" name="peach_merchant_id" label="Merchant ID"
            hint="Embedded Checkout → Merchant ID in your Peach dashboard"
            placeholder="3374483d87154b30805483cda201eee7"
            defaultValue={s.peach_merchant_id ?? process.env.PEACH_MERCHANT_ID ?? ''}
          />
          <FormFooter note="Credentials are stored in the database and never sent to the browser." />
        </form>
      </section>

      {/* ── SMTP / Email ─────────────────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Email / SMTP</h2>
            <p className="text-sm text-gray-500">
              Used for magic-link sign-in, order confirmations, and notifications.
              Falls back to <code className="text-xs">RESEND_API_KEY</code> env var if not set.
            </p>
          </div>
          <Badge configured={smtpConfigured} label={smtpConfigured ? 'SMTP active' : 'Not configured'} />
        </div>

        <form action={saveSmtpSettings} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="smtp_host" name="smtp_host" label="SMTP Host"
              placeholder="smtp.gmail.com"
              defaultValue={s.smtp_host ?? ''}
            />
            <Field
              id="smtp_port" name="smtp_port" label="Port" type="number"
              placeholder="587"
              defaultValue={s.smtp_port ?? '587'}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="smtp_secure" name="smtp_secure" type="checkbox"
              value="true"
              defaultChecked={s.smtp_secure === 'true'}
              className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
            />
            <label htmlFor="smtp_secure" className="text-sm text-gray-700">
              Use TLS / SSL (port 465)
            </label>
          </div>

          <Field
            id="smtp_user" name="smtp_user" label="Username / Email"
            placeholder="you@example.com"
            defaultValue={s.smtp_user ?? ''}
          />
          <Field
            id="smtp_pass" name="smtp_pass" label="Password" type="password"
            placeholder="••••••••"
            defaultValue={s.smtp_pass ?? ''}
          />

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <Field
              id="smtp_from_name" name="smtp_from_name" label="From Name"
              placeholder="Twine Organics"
              defaultValue={s.smtp_from_name ?? ''}
            />
            <Field
              id="smtp_from_email" name="smtp_from_email" label="From Email"
              placeholder="noreply@twineorganics.co.za"
              defaultValue={s.smtp_from_email ?? ''}
            />
          </div>

          <FormFooter note="SMTP password is stored securely in the database." />
        </form>
      </section>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Badge({ configured, label }: { configured: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      configured ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
    }`}>
      {label ?? (configured ? 'Configured' : 'Not configured')}
    </span>
  )
}

function Field({
  id, name, label, hint, type = 'text', placeholder, defaultValue,
}: {
  id: string; name: string; label: string; hint?: string
  type?: string; placeholder?: string; defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-400">{hint}</p>}
      <input
        id={id} name={name} type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none"
      />
    </div>
  )
}

function FormFooter({ note }: { note: string }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
      <p className="text-xs text-gray-400">{note}</p>
      <button
        type="submit"
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        Save
      </button>
    </div>
  )
}
