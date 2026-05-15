import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const db = new PrismaClient({ adapter })

// ─── Brand ────────────────────────────────────────────────────────────────────

const FOREST = '#1A2F28'
const EARTH  = '#BD7E4B'
const CREAM  = '#E7E4D7'
const BORDER = '#D6D1C4'
const MUTED  = '#6B6B65'
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://twineorganics.co.za'

// ─── Helpers (no tables — Tiptap-safe HTML only) ──────────────────────────────

function btn(label: string, url: string): string {
  return `<p style="margin:24px 0 0"><a href="${url}" style="display:inline-block;background:${FOREST};color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:7px;font-size:14px;font-weight:600;letter-spacing:0.3px">${label}</a></p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BORDER};margin:28px 0" />`
}

function orderBadge(id: string, total: string): string {
  return `<div style="background:${CREAM};border-radius:8px;padding:20px 24px;margin:24px 0">
  <p style="margin:0 0 4px;font-size:13px;color:${MUTED}">Order number</p>
  <p style="margin:0 0 12px;font-size:22px;font-weight:700;color:${FOREST}">#${id}</p>
  <p style="margin:0 0 4px;font-size:13px;color:${MUTED}">Order total</p>
  <p style="margin:0;font-size:22px;font-weight:700;color:${EARTH}">${total}</p>
</div>`
}

function refBadge(id: string): string {
  return `<div style="background:${CREAM};border-left:3px solid ${EARTH};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0">
  <p style="margin:0 0 2px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:${EARTH}">Order reference</p>
  <p style="margin:0;font-size:18px;font-weight:700;color:${FOREST}">#${id}</p>
</div>`
}

// ─── Templates (inner body content only — chrome added at send-time) ──────────

const TEMPLATES: {
  name: string
  trigger: string
  subject: string
  body: string
}[] = [
  // ── ORDER_PAID ────────────────────────────────────────────────────────────
  {
    name:    'Order Confirmed',
    trigger: 'ORDER_PAID',
    subject: 'Your order is confirmed — #{{order_id}} 🌿',
    body: `<h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:${FOREST}">Thank you, {{customer_name}}!</h2>
<p style="margin:0 0 4px;font-size:15px;color:${MUTED}">We've received your order and it's being prepared with care.</p>
${orderBadge('{{order_id}}', '{{order_total}}')}
<p style="margin:0;font-size:14px;color:${MUTED};line-height:1.6">We'll send you another email as soon as your order is on its way. You can also track your order at any time from your account.</p>
${btn('View your order', '{{order_link}}')}
${divider()}
<p style="margin:0;font-size:13px;color:${MUTED};line-height:1.6">All Twine Organics products are certified organic and ethically sourced. Thank you for supporting sustainable farming.</p>`,
  },

  // ── ORDER_SHIPPED ─────────────────────────────────────────────────────────
  {
    name:    'Order Shipped',
    trigger: 'ORDER_SHIPPED',
    subject: 'Your order #{{order_id}} is on its way 📦',
    body: `<h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:${FOREST}">It's on its way, {{customer_name}}!</h2>
<p style="margin:0 0 4px;font-size:15px;color:${MUTED}">Your order has been dispatched and is heading to you now.</p>
${refBadge('{{order_id}}')}
<p style="margin:0;font-size:14px;color:${MUTED};line-height:1.6">Keep an eye on your order status from your account. We'll notify you once it arrives.</p>
${btn('Track your order', '{{order_link}}')}`,
  },

  // ── ORDER_DELIVERED ───────────────────────────────────────────────────────
  {
    name:    'Order Delivered',
    trigger: 'ORDER_DELIVERED',
    subject: 'Your Twine Organics order has arrived ✅',
    body: `<h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:${FOREST}">Your order has arrived!</h2>
<p style="margin:0 0 4px;font-size:15px;color:${MUTED}">We hope you love it, {{customer_name}}.</p>
${refBadge('{{order_id}}')}
<p style="margin:0 0 24px;font-size:14px;color:${MUTED};line-height:1.6">Your organic goodness has been delivered. We'd love to hear what you think — your feedback helps us grow and improve.</p>
${btn('View your order', '{{order_link}}')}
${divider()}
<p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${FOREST}">Enjoyed your order?</p>
<p style="margin:0;font-size:13px;color:${MUTED};line-height:1.6">Share the love — tell a friend about Twine Organics and help us bring more people closer to organic living.</p>`,
  },

  // ── ORDER_CANCELLED ───────────────────────────────────────────────────────
  {
    name:    'Order Cancelled',
    trigger: 'ORDER_CANCELLED',
    subject: 'Your order #{{order_id}} has been cancelled',
    body: `<h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:${FOREST}">Order cancelled</h2>
<p style="margin:0 0 4px;font-size:15px;color:${MUTED}">Hi {{customer_name}}, we're sorry to see this go.</p>
<div style="background:#fff8f6;border:1px solid #fde8e0;border-radius:8px;padding:20px 24px;margin:24px 0">
  <p style="margin:0 0 4px;font-size:13px;color:${MUTED}">Cancelled order</p>
  <p style="margin:0;font-size:20px;font-weight:700;color:#b45309">#{{order_id}}</p>
</div>
<p style="margin:0 0 12px;font-size:14px;color:${MUTED};line-height:1.6">Your order has been cancelled. If a payment was made, a refund will be processed within 3–5 business days depending on your bank.</p>
<p style="margin:0 0 24px;font-size:14px;color:${MUTED};line-height:1.6">If you believe this was a mistake or have questions, please don't hesitate to reach out — we're happy to help.</p>
${btn('Browse our products', `${SITE}/products`)}`,
  },

  // ── CUSTOMER_WELCOME ──────────────────────────────────────────────────────
  {
    name:    'Welcome to Twine Organics',
    trigger: 'CUSTOMER_WELCOME',
    subject: 'Welcome to Twine Organics, {{customer_name}} 🌱',
    body: `<h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:${FOREST}">Welcome, {{customer_name}}!</h2>
<p style="margin:0 0 28px;font-size:15px;color:${MUTED}">We're so glad you're here. Your journey to organic living starts now.</p>
<div style="background:${CREAM};border-radius:8px;padding:20px 24px;margin-bottom:20px">
  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${FOREST}">🌿 Certified Organic</p>
  <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.5">Every product we carry is certified organic — grown without synthetic pesticides or fertilisers.</p>
</div>
<div style="background:${CREAM};border-radius:8px;padding:20px 24px;margin-bottom:20px">
  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${FOREST}">🤝 Ethical Sourcing</p>
  <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.5">We partner directly with small-scale farmers who share our commitment to people and planet.</p>
</div>
<div style="background:${CREAM};border-radius:8px;padding:20px 24px;margin-bottom:24px">
  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${FOREST}">📦 Delivered to You</p>
  <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.5">Fresh, natural products packed carefully and shipped straight to your door across South Africa.</p>
</div>
${btn('Shop now', `${SITE}/products`)}
${divider()}
<p style="margin:0;font-size:13px;color:${MUTED};line-height:1.6;text-align:center">Questions or just want to say hello?<br><a href="mailto:hello@twineorganics.co.za" style="color:${FOREST};text-decoration:underline">hello@twineorganics.co.za</a></p>`,
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding default email flow templates…\n')

  for (const { name, trigger, subject, body } of TEMPLATES) {
    const existing = await db.emailTemplate.findFirst({ where: { name } })

    let template
    if (existing) {
      template = await db.emailTemplate.update({
        where: { id: existing.id },
        data:  { subject, body },
      })
      console.log(`  Updated:  ${name}`)
    } else {
      template = await db.emailTemplate.create({ data: { name, subject, body } })
      console.log(`  Created:  ${name}`)
    }

    const existingFlow = await db.emailFlow.findUnique({
      where: { trigger: trigger as never },
    })
    if (!existingFlow) {
      await db.emailFlow.create({
        data: { trigger: trigger as never, templateId: template.id, isActive: false },
      })
      console.log(`  Flow set: ${trigger} → ${name} (inactive by default)\n`)
    } else {
      console.log(`  Flow exists for ${trigger} — skipped\n`)
    }
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
