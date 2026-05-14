import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'
import { savePaymentSettings } from './actions'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const settings = await getSettings(['peach_base_url', 'peach_entity_id', 'peach_access_token'])

  const peachBaseUrl = settings.peach_base_url ?? process.env.PEACH_BASE_URL ?? ''
  const peachEntityId = settings.peach_entity_id ?? process.env.PEACH_ENTITY_ID ?? ''
  const peachAccessToken = settings.peach_access_token ?? process.env.PEACH_ACCESS_TOKEN ?? ''

  const isConfigured = !!(peachBaseUrl && peachEntityId && peachAccessToken)

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mb-8 text-sm text-gray-500">
        Site configuration. Values saved here override environment variables.
      </p>

      {/* Payment Provider */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Peach Payments</h2>
            <p className="text-sm text-gray-500">
              Used for card checkout. Get credentials from your{' '}
              <a
                href="https://merchant.peachpayments.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                Peach merchant dashboard
              </a>
              .
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isConfigured
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isConfigured ? 'Configured' : 'Not configured'}
          </span>
        </div>

        <form action={savePaymentSettings} className="space-y-5 px-6 py-5">
          {/* Base URL */}
          <div>
            <label htmlFor="peach_base_url" className="block text-sm font-medium text-gray-700">
              Base URL
            </label>
            <p className="mb-1 text-xs text-gray-400">
              Test: https://eu-test.oppwa.com &nbsp;·&nbsp; Production: https://oppwa.com
            </p>
            <input
              id="peach_base_url"
              name="peach_base_url"
              type="url"
              defaultValue={peachBaseUrl}
              placeholder="https://eu-test.oppwa.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Entity ID */}
          <div>
            <label htmlFor="peach_entity_id" className="block text-sm font-medium text-gray-700">
              Entity ID
            </label>
            <p className="mb-1 text-xs text-gray-400">
              Found in your Peach dashboard under Channels → Entity ID
            </p>
            <input
              id="peach_entity_id"
              name="peach_entity_id"
              type="text"
              defaultValue={peachEntityId}
              placeholder="8a8294174b7ecb28014b9699220015ca"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Access Token */}
          <div>
            <label
              htmlFor="peach_access_token"
              className="block text-sm font-medium text-gray-700"
            >
              Access Token
            </label>
            <p className="mb-1 text-xs text-gray-400">
              Found in your Peach dashboard under Integration → Access Token
            </p>
            <input
              id="peach_access_token"
              name="peach_access_token"
              type="text"
              defaultValue={peachAccessToken}
              placeholder="OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg="
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Credentials are stored securely in the database and never exposed to the browser.
            </p>
            <button
              type="submit"
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
