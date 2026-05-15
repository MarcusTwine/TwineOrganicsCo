'use client'

import { useState } from 'react'
import AutomationList from './AutomationList'
import TemplateList from './TemplateList'
import { TRIGGER_META } from './trigger-meta'

type Template = { id: string; name: string; subject: string; body: string }
type Flow     = { trigger: string; templateId: string; isActive: boolean; template: { name: string } }

interface Props {
  templates: Template[]
  flows: Flow[]
}

type Tab = 'automations' | 'templates'

export default function FlowsClient({ templates, flows }: Props) {
  const [tab, setTab] = useState<Tab>('automations')

  const activeCount   = flows.filter((f) => f.isActive).length
  const configuredCount = flows.length

  // Enrich templates with which flows use them
  const flowTriggerMap = Object.fromEntries(flows.map((f) => [f.templateId, f.trigger]))
  const enrichedTemplates = templates.map((t) => {
    const trigger = flowTriggerMap[t.id]
    return {
      ...t,
      usedBy: trigger ? [TRIGGER_META[trigger as keyof typeof TRIGGER_META]?.label ?? trigger] : [],
    }
  })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'automations', label: 'Automations', count: configuredCount },
    { key: 'templates',   label: 'Templates',   count: templates.length },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Email Flows</h1>
        <p className="mt-1 text-sm text-gray-500">
          Automate emails sent to customers when specific events occur.
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
              {activeCount} active automation{activeCount === 1 ? '' : 's'}
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'automations' && (
        <AutomationList flows={flows} templates={templates} />
      )}
      {tab === 'templates' && (
        <TemplateList templates={enrichedTemplates} />
      )}
    </div>
  )
}
