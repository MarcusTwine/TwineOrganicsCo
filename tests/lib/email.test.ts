import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('resend', () => {
  const mockSend = vi.fn().mockResolvedValue({ id: 'email-id-123' })
  return {
    Resend: class {
      emails = { send: mockSend }
    },
  }
})

import { sendPasswordResetEmail, sendOrderConfirmationEmail } from '@/lib/email'

const { Resend } = await import('resend')
const mockResendInstance = new Resend()
const mockSend = mockResendInstance.emails.send as unknown as Mock

describe('sendPasswordResetEmail', () => {
  beforeEach(() => mockSend.mockClear())

  it('calls Resend with correct recipient and reset URL', async () => {
    await sendPasswordResetEmail('user@example.com', 'https://example.com/reset/token123')

    expect(mockSend).toHaveBeenCalledOnce()
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe('user@example.com')
    expect(call.html).toContain('https://example.com/reset/token123')
    expect(call.subject).toContain('password')
  })
})

describe('sendOrderConfirmationEmail', () => {
  beforeEach(() => mockSend.mockClear())

  it('sends email to the user with order number, item names, total, and delivery address', async () => {
    const orderData = {
      id: 'clxabcdef1234',
      total: 130,
      createdAt: new Date('2026-05-07T10:00:00Z'),
      deliveryAddress: {
        fullName: 'Alice',
        addressLine1: '1 Main St',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        phone: '0821234567',
      },
      items: [
        { quantity: 2, priceAtPurchase: 50, product: { name: 'Organic Honey' } },
        { quantity: 1, priceAtPurchase: 30, product: { name: 'Rooibos Tea' } },
      ],
      user: { name: 'Alice', email: 'alice@example.com' },
    }

    await sendOrderConfirmationEmail(orderData)

    expect(mockSend).toHaveBeenCalledOnce()
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe('alice@example.com')
    expect(call.subject).toContain('confirmed')
    expect(call.html).toContain('Alice')
    expect(call.html).toContain('Organic Honey')
    expect(call.html).toContain('Rooibos Tea')
    expect(call.html).toContain('R130.00')
    expect(call.html).toContain('1 Main St')
    expect(call.html).toContain('Cape Town')
  })
})
