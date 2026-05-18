import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Anonymise reviewer name: "Jane Smith" → "Jane S."
function anonymiseName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return escapeXml(parts[0])
  return escapeXml(`${parts[0]} ${parts[parts.length - 1][0]}.`)
}

export async function GET() {
  const siteUrl = (process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

  const reviews = await db.review.findMany({
    where: { isApproved: true },
    include: {
      product: { select: { name: true, slug: true, images: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const reviewXml = reviews.map((r) => {
    const productUrl = `${siteUrl}/products/${r.product.slug}`
    const reviewUrl = `${productUrl}#reviews`

    return `    <review>
      <review_id>${escapeXml(r.id)}</review_id>
      <reviewer>
        <name>${anonymiseName(r.user.name)}</name>
      </reviewer>
      <review_timestamp>${r.createdAt.toISOString()}</review_timestamp>${r.title ? `
      <title>${escapeXml(r.title)}</title>` : ''}
      <content>${escapeXml(r.body)}</content>
      <review_url type="singleton">${escapeXml(reviewUrl)}</review_url>
      <ratings>
        <overall min="1" max="5">${r.rating}</overall>
      </ratings>
      <products>
        <product>
          <product_ids>
            <skus>
              <sku>${escapeXml(r.product.slug)}</sku>
            </skus>
          </product_ids>
          <product_name>${escapeXml(r.product.name)}</product_name>
          <product_url>${escapeXml(productUrl)}</product_url>
        </product>
      </products>
    </review>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:vc="http://www.w3.org/2007/XMLSchema-versioning"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="http://www.gstatic.com/productsreview/schema/latest/product_reviews.xsd">
  <version>2.3</version>
  <aggregator>
    <name>Twine Organics</name>
  </aggregator>
  <publisher>
    <name>Twine Organics</name>
    <favicon>${escapeXml(`${siteUrl}/favicon.ico`)}</favicon>
  </publisher>
  <reviews>
${reviewXml}
  </reviews>
</feed>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
