'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import TemplateFormPanel from './TemplateFormPanel'
import { deleteTemplate } from '../actions'

type Template = {
  id: string
  name: string
  subject: string
  body: string
  usedBy: string[]
}

interface Props {
  templates: Template[]
}

export default function TemplateList({ templates }: Props) {
  const [panel, setPanel] = useState<'new' | Template | null>(null)
  const [deleting, startDelete] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('Delete this template? Any flows using it will need to be reconfigured.')) return
    startDelete(async () => {
      await deleteTemplate(id)
      router.refresh()
    })
  }

  const editing = panel !== 'new' && panel !== null ? panel : null

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {templates.length === 0
            ? 'No templates yet. Create one to start building automations.'
            : `${templates.length} template${templates.length === 1 ? '' : 's'}`}
        </p>
        <button
          type="button"
          onClick={() => setPanel('new')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#1A3526] rounded-md hover:bg-[#1A3526]/90 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
          New template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-400">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No templates yet</p>
          <p className="text-xs text-gray-500 mb-4">Create a template to use in your automations</p>
          <button
            type="button"
            onClick={() => setPanel('new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#1A3526] rounded-md hover:bg-[#1A3526]/90 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
            New template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
              {/* Icon + name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F5F3EE] border border-[#E8E3D9] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#C8994A]">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{t.subject}</p>
                </div>
              </div>

              {/* Used by */}
              <div className="text-xs text-gray-400">
                {t.usedBy.length === 0
                  ? 'Not used in any automation'
                  : `Used in: ${t.usedBy.join(', ')}`}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button
                  type="button"
                  onClick={() => setPanel(t)}
                  className="flex-1 text-center text-sm font-medium py-1.5 px-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deleting || t.usedBy.length > 0}
                  onClick={() => handleDelete(t.id)}
                  title={t.usedBy.length > 0 ? 'Remove from automations before deleting' : 'Delete template'}
                  className="text-sm font-medium py-1.5 px-3 rounded-md border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {panel !== null && (
        <TemplateFormPanel
          key={editing?.id ?? 'new'}
          template={editing}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  )
}
