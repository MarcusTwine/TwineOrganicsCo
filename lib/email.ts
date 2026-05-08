import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'Twine Organics <noreply@twineorganics.co.za>'

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Reset your password — Twine Organics',
    html: `
      <p>You requested a password reset for your Twine Organics account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
    `,
  })
}

type DeliveryAddress = {
  fullName: string
  addressLine1: string
  city: string
  province: string
  postalCode: string
  phone: string
}

type OrderEmailData = {
  id: string
  total: unknown
  createdAt: Date
  deliveryAddress: unknown
  items: {
    quantity: number
    priceAtPurchase: unknown
    product: { name: string }
  }[]
  user: { name: string; email: string }
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  const address = order.deliveryAddress as DeliveryAddress
  const shortId = order.id.slice(-8).toUpperCase()

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${item.product.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">R${Number(item.priceAtPurchase).toFixed(2)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">R${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</td>
        </tr>`,
    )
    .join('')

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.user.email,
    subject: `Order confirmed — #${shortId} | Twine Organics`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827">
        <div style="background:#166534;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Twine Organics</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-size:20px;margin-bottom:8px">Thank you for your order, ${order.user.name}!</h2>
          <p style="color:#6b7280;margin-bottom:24px">
            Order #${shortId} &bull; ${dateStr}
          </p>

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
              ${address.fullName}<br>
              ${address.addressLine1}<br>
              ${address.city}, ${address.province} ${address.postalCode}<br>
              ${address.phone}
            </p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}"
             style="display:inline-block;background:#166534;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">
            View Your Order
          </a>
        </div>

        <div style="border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;color:#9ca3af;font-size:14px">
          Questions? Contact us at
          <a href="mailto:hello@twineorganics.co.za" style="color:#166534">hello@twineorganics.co.za</a>
        </div>
      </div>
    `,
  })
}
