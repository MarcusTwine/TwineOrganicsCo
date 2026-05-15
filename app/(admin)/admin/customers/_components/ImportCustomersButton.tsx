'use client'

import { useRef, useState, useTransition } from 'react'
import { importCustomers, type ImportRow, type ImportResult } from '../actions'

type ParsedRow = ImportRow & { _line: number }

function col(cols: string[], idx: number): string | undefined {
  return idx !== -1 ? (cols[idx] ?? '') : undefined
}

function parseCsv(text: string): { rows: ParsedRow[]; error: string | null } {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { rows: [], error: 'CSV must have a header row and at least one data row.' }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''))
  const idx = (key: string) => header.indexOf(key)

  const nameIdx = idx('name')
  const emailIdx = idx('email')
  if (nameIdx === -1 || emailIdx === -1) {
    return { rows: [], error: 'CSV must have "name" and "email" columns.' }
  }

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    rows.push({
      _line: i + 1,
      name:                cols[nameIdx] ?? '',
      email:               cols[emailIdx] ?? '',
      phone:               col(cols, idx('phone')),
      addressLine1:        col(cols, idx('addressline1')),
      addressLine2:        col(cols, idx('addressline2')),
      city:                col(cols, idx('city')),
      province:            col(cols, idx('province')),
      postalCode:          col(cols, idx('postalcode')),
      billingAddressLine1: col(cols, idx('billingaddressline1')),
      billingAddressLine2: col(cols, idx('billingaddressline2')),
      billingCity:         col(cols, idx('billingcity')),
      billingProvince:     col(cols, idx('billingprovince')),
      billingPostalCode:   col(cols, idx('billingpostalcode')),
      newsletter:          col(cols, idx('newsletter')),
    })
  }
  return { rows, error: null }
}

export default function ImportCustomersButton() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [pending, startTransition] = useTransition()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { rows: parsed, error } = parseCsv(text)
      setParseError(error)
      setRows(parsed)
      setResult(null)
    }
    reader.readAsText(file)
  }

  function handleImport() {
    startTransition(async () => {
      const res = await importCustomers(rows.map(({ name, email, phone, addressLine1, addressLine2, city, province, postalCode, billingAddressLine1, billingAddressLine2, billingCity, billingProvince, billingPostalCode, newsletter }) => ({
        name, email, phone, addressLine1, addressLine2, city, province, postalCode, billingAddressLine1, billingAddressLine2, billingCity, billingProvince, billingPostalCode, newsletter,
      })))
      setResult(res)
    })
  }

  function handleClose() {
    setOpen(false)
    setRows([])
    setParseError(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Import Customers</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Format hint */}
              {!result && (
                <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Expected CSV columns:</p>
                  <code className="text-gray-800">name, email, phone, addressLine1, addressLine2, city, province, postalCode, billingAddressLine1, billingAddressLine2, billingCity, billingProvince, billingPostalCode, newsletter</code>
                  <p className="mt-1 text-gray-500">
                    Only <strong>name</strong> and <strong>email</strong> are required. All others are optional.
                    Use <code>yes</code> / <code>no</code> for newsletter. Existing emails will be skipped.
                  </p>
                </div>
              )}

              {/* File input */}
              {!result && (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Select CSV file</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFile}
                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                  />
                </label>
              )}

              {parseError && (
                <p className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{parseError}</p>
              )}

              {/* Preview table */}
              {!result && rows.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">{rows.length} row{rows.length !== 1 ? 's' : ''} found</p>
                  <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Phone</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">City</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Newsletter</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {rows.slice(0, 100).map((row) => (
                          <tr key={row._line} className={!row.name || !row.email ? 'bg-red-50' : ''}>
                            <td className="px-3 py-2 text-gray-400">{row._line}</td>
                            <td className="px-3 py-2 text-gray-700">{row.name || <span className="text-red-500 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-gray-700">{row.email || <span className="text-red-500 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-gray-500">{row.phone || '—'}</td>
                            <td className="px-3 py-2 text-gray-500">{row.city || '—'}</td>
                            <td className="px-3 py-2 text-gray-500">{row.newsletter || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 100 && (
                    <p className="mt-1 text-xs text-gray-400">Showing first 100 rows. All {rows.length} will be imported.</p>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Created', value: result.created, colour: 'text-green-700 bg-green-50 border-green-200' },
                      { label: 'Skipped', value: result.skipped, colour: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                      { label: 'Subscribed', value: result.subscribed, colour: 'text-blue-700 bg-blue-50 border-blue-200' },
                    ].map(({ label, value, colour }) => (
                      <div key={label} className={`rounded-md border px-4 py-3 text-center ${colour}`}>
                        <p className="text-2xl font-semibold">{value}</p>
                        <p className="text-xs font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-sm font-medium text-red-700 mb-1">Issues</p>
                      <ul className="space-y-0.5">
                        {result.errors.map((e, i) => (
                          <li key={i} className="text-xs text-red-600">{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {result ? 'Close' : 'Cancel'}
              </button>
              {!result && (
                <button
                  onClick={handleImport}
                  disabled={rows.length === 0 || pending}
                  className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
                >
                  {pending ? 'Importing…' : `Import ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
