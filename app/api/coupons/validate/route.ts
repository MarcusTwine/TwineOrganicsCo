import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const code: string = body?.code?.toString().trim().toUpperCase() ?? ''
  const orderTotal: number = Number(body?.orderTotal) ?? 0

  if (!code) {
    return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 })
  }

  const coupon = await db.coupon.findUnique({ where: { code } })

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: 'Invalid or inactive coupon code.' }, { status: 404 })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This coupon has expired.' }, { status: 410 })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 410 })
  }

  if (coupon.minOrderAmount !== null && orderTotal < Number(coupon.minOrderAmount)) {
    return NextResponse.json(
      { error: `Minimum order of R${Number(coupon.minOrderAmount).toFixed(2)} required for this coupon.` },
      { status: 422 },
    )
  }

  const discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.min(orderTotal * (Number(coupon.discountValue) / 100), orderTotal)
      : Math.min(Number(coupon.discountValue), orderTotal)

  return NextResponse.json({
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    discountAmount: Math.round(discountAmount * 100) / 100,
    description: coupon.description,
  })
}
