'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TRIGGER_META, TRIGGER_KEYS, TriggerKey } from './trigger-meta'
import FlowModal from './FlowModal'
import { toggleFlow } from '../actions'
import { FlowTrigger } from '@/app/generated/prisma/enums'

type Template = { id: string; name: string; subject: string }
type Flow     = { trigger: string; templateId: string; isActive: boolean; template: { name: string } }

interface Props {
  flows: Flow[]
  templates: Template[]
}

export default function AutomationList({ flows, templates }: Props) {
  const [editing, setEditing] = useState<TriggerKey | null>(null)
  const [toggling, startToggle] = useTransition()
  const router = useRouter()

  const flowMap = Object.fromEntries(flows.map((f) => [f.trigger, f]))

  function handleToggle(trigger: TriggerKey, current: boolean) {
    startToggle(async () => {
      await toggleFlow(trigger as FlowTrigger, !current)
      router.refresh()
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TRIGGER_KEYS.map((key) => {
          const meta = TRIGGER_META[key]
          const flow = flowMap[key] as Flow | undefined

          return (
            <div
              key={key}
              className={`rounded-xl border bg-white p-5 flex flex-col gap-4 transition-colors ${
                flow ? 'border-gray-200' : 'border-dashed border-gray-300'
              }`}
            >
              {/* Icon + label */}
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  flow ? 'bg-[#1A3526] text-[#C8994A]' : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d={meta.icon}/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{meta.label}</h3>
                    {flow && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        flow.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${flow.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}/>
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{meta.description}</p>
                </div>
              </div>

              {/* Template info or empty state */}
              {flow ? (
                <div className="rounded-lg bg-[#F5F3EE] border border-[#E8E3D9] px-3 py-2.5 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#C8994A] shrink-0">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm text-gray-800 font-medium truncate">{flow.template.name}</span>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 border border-dashed border-gray-200 px-3 py-2.5 text-center">
                  <p className="text-xs text-gray-400">No template assigned</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-0">
                <button
                  type="button"
                  onClick={() => setEditing(key)}
                  className="flex-1 text-center text-sm font-medium py-1.5 px-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {flow ? 'Edit' : 'Set up'}
                </button>

                {flow && (
                  <button
                    type="button"
                    disabled={toggling}
                    onClick={() => handleToggle(key, flow.isActive)}
                    className={`text-sm font-medium py-1.5 px-3 rounded-md border transition-colors disabled:opacity-50 ${
                      flow.isActive
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'border-[#1A3526] text-[#1A3526] hover:bg-[#1A3526]/5'
                    }`}
                  >
                    {flow.isActive ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <FlowModal
          trigger={editing}
          flow={flowMap[editing] ?? null}
          templates={templates}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
