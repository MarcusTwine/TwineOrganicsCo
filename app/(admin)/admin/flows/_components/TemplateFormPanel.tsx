'use client'

import { useActionState, useState, useEffect } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { createTemplate, updateTemplate } from '../actions'
import { ALL_VARIABLES } from './trigger-meta'

type Template = { id: string; name: string; subject: string; body: string }

interface Props {
  template?: Template | null
  onClose: () => void
}

const initialState = { error: '', success: false }

export default function TemplateFormPanel({ template, onClose }: Props) {
  const isEdit = !!template

  const boundAction = isEdit
    ? updateTemplate.bind(null, template.id)
    : createTemplate

  const [state, formAction, pending] = useActionState(boundAction, initialState)
  const [body, setBody] = useState(template?.body ?? '')

  useEffect(() => {
    setBody(template?.body ?? '')
  }, [template?.id])

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success])

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Template' : 'New Template'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
              <path d="M4 4l12 12M16 4L4 16"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {state.error && (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
          )}

          <form id="template-form" action={formAction} className="space-y-5">
            <input type="hidden" name="body" value={body} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template name</label>
              <input
                name="name"
                defaultValue={template?.name}
                required
                placeholder="e.g. Order Thank You"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1A3526] focus:outline-none focus:ring-1 focus:ring-[#1A3526]"
              />
              <p className="mt-1 text-xs text-gray-400">Internal name — not visible to customers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email subject</label>
              <input
                name="subject"
                defaultValue={template?.subject}
                required
                placeholder="e.g. Thank you for your order, {{customer_name}}!"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1A3526] focus:outline-none focus:ring-1 focus:ring-[#1A3526]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Body</label>
              </div>
              <RichTextEditor value={body} onChange={setBody} outputFormat="html" />
            </div>

            {/* Variable reference */}
            <div className="rounded-lg bg-[#F5F3EE] border border-[#E8E3D9] p-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Available variables — click to copy</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(`{{${v}}}`)}
                    title="Click to copy"
                    className="font-mono text-xs px-2 py-1 rounded bg-white border border-[#D9D4C8] text-[#1A3526] hover:bg-[#1A3526] hover:text-white hover:border-[#1A3526] transition-colors"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">Use these in the subject or body. They are replaced with real values when the email is sent.</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            form="template-form"
            type="submit"
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1A3526] rounded-md hover:bg-[#1A3526]/90 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create template'}
          </button>
        </div>
      </div>
    </div>
  )
}
