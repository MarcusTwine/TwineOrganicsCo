import type { Metadata } from 'next'
import { db } from '@/lib/db'
import FlowsClient from './_components/FlowsClient'

export const metadata: Metadata = { title: 'Email Flows' }

export default async function FlowsPage() {
  const [templates, flows] = await Promise.all([
    db.emailTemplate.findMany({ orderBy: { createdAt: 'asc' } }),
    db.emailFlow.findMany({
      include: { template: { select: { name: true } } },
    }),
  ])

  const serialisedTemplates = templates.map((t) => ({
    id:        t.id,
    name:      t.name,
    subject:   t.subject,
    body:      t.body,
  }))

  const serialisedFlows = flows.map((f) => ({
    trigger:    f.trigger,
    templateId: f.templateId,
    isActive:   f.isActive,
    template:   { name: f.template.name },
  }))

  return <FlowsClient templates={serialisedTemplates} flows={serialisedFlows} />
}
