import nodemailer from 'nodemailer'
import { getSettings } from '@/lib/settings'

const DEFAULT_FROM_NAME = 'Twine Organics'
const DEFAULT_FROM_EMAIL = 'noreply@twineorganics.co.za'

type EmailPayload = { to: string; subject: string; html: string }

async function sendEmail({ to, subject, html }: EmailPayload) {
  const s = await getSettings([
    'smtp_host', 'smtp_port', 'smtp_secure',
    'smtp_user', 'smtp_pass', 'smtp_from_name', 'smtp_from_email',
  ])

  // ── SMTP (DB settings take priority) ─────────────────────────────────────
  if (s.smtp_host && s.smtp_user && s.smtp_pass) {
    const fromName  = s.smtp_from_name  || DEFAULT_FROM_NAME
    const fromEmail = s.smtp_from_email || DEFAULT_FROM_EMAIL
    const transport = nodemailer.createTransport({
      host: s.smtp_host,
      port: parseInt(s.smtp_port || '587', 10),
      secure: s.smtp_secure === 'true',
      auth: { user: s.smtp_user, pass: s.smtp_pass },
    })
    await transport.sendMail({ from: `${fromName} <${fromEmail}>`, to, subject, html })
    return
  }

  // ── Resend fallback ───────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to, subject, html,
    })
    return
  }

  throw new Error(
    'No email transport configured. Add SMTP settings in Admin → Settings, or set RESEND_API_KEY.',
  )
}

// ─── Magic Link ───────────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  await sendEmail({
    to: email,
    subject: 'Your sign-in link — Twine Organics',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111827">
        <div style="background:#166534;padding:20px 24px">
          <h1 style="color:white;margin:0;font-size:20px">Twine Organics</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-size:18px;margin-bottom:8px">Sign in to your account</h2>
          <p style="color:#6b7280;margin-bottom:24px">
            Click the button below to sign in. This link expires in
            <strong>15&nbsp;minutes</strong> and can only be used once.
          </p>
          <a href="${magicLink}"
             style="display:inline-block;background:#166534;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">
            Continue to Twine Organics
          </a>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">
            If you didn't request this, you can safely ignore this email.<br>
            Or paste this URL into your browser:<br>${magicLink}
          </p>
        </div>
      </div>
    `,
  })
}

// ─── Order Confirmation ───────────────────────────────────────────────────────

type DeliveryAddress = {
  fullName: string; addressLine1: string; city: string
  province: string; postalCode: string; phone: string
}

type OrderEmailData = {
  id: string; total: unknown; createdAt: Date; deliveryAddress: unknown
  items: { quantity: number; priceAtPurchase: unknown; product: { name: string } }[]
  user: { name: string; email: string }
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const address = order.deliveryAddress as DeliveryAddress
  const shortId = order.id.slice(-8).toUpperCase()
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${item.product.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">R${Number(item.priceAtPurchase).toFixed(2)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">R${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</td>
    </tr>`).join('')

  await sendEmail({
    to: order.user.email,
    subject: `Order confirmed — #${shortId} | Twine Organics`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827">
        <div style="background:#166534;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Twine Organics</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-size:20px;margin-bottom:8px">Thank you, ${order.user.name}!</h2>
          <p style="color:#6b7280;margin-bottom:24px">Order #${shortId} &bull; ${dateStr}</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb">
                <th style="text-align:left;padding:8px 0;font-size:12px;text-transform:uppercase;color:#6b7280">Product</th>
                <th style="text-align:center;padding:8px 0;font-size:12px;text-transform:uppercase;color:#6b7280">Qty</th>
                <th style="text-align:right;padding:8px 0;font-size:12px;text-transform:uppercase;color:#6b7280">Unit</th>
                <th style="text-align:right;padding:8px 0;font-size:12px;text-transform:uppercase;color:#6b7280">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:12px 0;text-align:right;font-weight:bold">Order Total</td>
                <td style="padding:12px 0;text-align:right;font-weight:bold;font-size:18px">R${Number(order.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
            <h3 style="font-size:14px;text-transform:uppercase;color:#6b7280;margin:0 0 8px">Delivery Address</h3>
            <p style="margin:0;line-height:1.6">
              ${address.fullName}<br>${address.addressLine1}<br>
              ${address.city}, ${address.province} ${address.postalCode}<br>${address.phone}
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}"
             style="display:inline-block;background:#166534;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">
            View Your Order
          </a>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;color:#9ca3af;font-size:14px">
          Questions? <a href="mailto:hello@twineorganics.co.za" style="color:#166534">hello@twineorganics.co.za</a>
        </div>
      </div>
    `,
  })
}
