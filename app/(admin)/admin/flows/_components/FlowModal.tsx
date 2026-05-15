'use client'

import { useActionState, useEffect } from 'react'
import { upsertFlow, removeFlow } from '../actions'
import { TRIGGER_META, TriggerKey } from './trigger-meta'
import { FlowTrigger } from '@/app/generated/prisma/enums'

type Template = { id: string; name: string; subject: string }
type Flow     = { templateId: string; isActive: boolean }

interface Props {
  trigger: TriggerKey
  flow?: Flow | null
  templates: Template[]
  onClose: () => void
}

const initialState = { error: '', success: false }

export default function FlowModal({ trigger, flow, templates, onClose }: Props) {
  const meta        = TRIGGER_META[trigger]
  const boundAction = upsertFlow.bind(null, trigger as FlowTrigger)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success])

  async function handleRemove() {
    await removeFlow(trigger as FlowTrigger)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Configure Automation</h2>
              <p className="text-sm text-gray-500 mt-0.5">{meta.label}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-0.5"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
                <path d="M4 4l12 12M16 4L4 16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="flow-form" action={formAction} className="px-6 py-5 space-y-4">
          {state.error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email template</label>
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No templates yet — create one in the Templates tab first.</p>
            ) : (
              <select
                name="templateId"
                defaultValue={flow?.templateId ?? ''}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:border-[#1A3526] focus:outline-none focus:ring-1 focus:ring-[#1A3526]"
              >
                <option value="" disabled>Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-3">
              {[
                { value: 'true',  label: 'Active',   desc: 'Emails are sent' },
                { value: 'false', label: 'Inactive', desc: 'No emails sent' },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className="flex-1 flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer has-[:checked]:border-[#1A3526] has-[:checked]:bg-[#1A3526]/5 transition-colors"
                >
                  <input
                    type="radio"
                    name="isActive"
                    value={value}
                    defaultChecked={value === 'true' ? (flow?.isActive ?? true) : !(flow?.isActive ?? true)}
                    className="accent-[#1A3526]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Variable hint */}
          <div className="rounded-md bg-[#F5F3EE] p-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Available variables for this trigger: </span>
            {meta.variables.map((v) => (
              <code key={v} className="mx-0.5 px-1 py-0.5 rounded bg-white border border-[#E8E3D9] text-[#1A3526]">{`{{${v}}}`}</code>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          {flow && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Remove
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            form="flow-form"
            type="submit"
            disabled={pending || templates.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[#1A3526] rounded-md hover:bg-[#1A3526]/90 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
