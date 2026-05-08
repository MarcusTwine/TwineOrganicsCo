import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const {
  mockFindUser,
  mockFindManyTokens,
  mockCreateToken,
  mockUpdateToken,
  mockUpdateUser,
  mockSendReset,
} = vi.hoisted(() => ({
  mockFindUser: vi.fn(),
  mockFindManyTokens: vi.fn(),
  mockCreateToken: vi.fn(),
  mockUpdateToken: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockSendReset: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: mockFindUser, update: mockUpdateUser },
    passwordResetToken: {
      findMany: mockFindManyTokens,
      create: mockCreateToken,
      update: mockUpdateToken,
    },
  },
}))

vi.mock('@/lib/email', () => ({ sendPasswordResetEmail: mockSendReset }))
vi.mock('@/lib/hash', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_token'),
  verifyPassword: vi.fn(),
}))

import { NextRequest } from 'next/server'
import { POST as requestReset } from '@/app/api/auth/reset-password/route'
import { POST as confirmReset } from '@/app/api/auth/reset-password/[token]/route'
import { verifyPassword } from '@/lib/hash'

const makeReq = (url: string, body: object) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest

describe('POST /api/auth/reset-password (request)', () => {
  beforeEach(() => {
    ;(mockFindUser as unknown as Mock).mockReset()
    ;(mockCreateToken as unknown as Mock).mockReset()
    ;(mockSendReset as unknown as Mock).mockReset()
  })

  it('always returns 200 even when email not found (prevents enumeration)', async () => {
    ;(mockFindUser as unknown as Mock).mockResolvedValue(null)
    const res = await requestReset(makeReq('http://localhost/api/auth/reset-password', { email: 'x@y.com' }))
    expect(res.status).toBe(200)
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('sends reset email when user exists', async () => {
    ;(mockFindUser as unknown as Mock).mockResolvedValue({ id: 'user-1', email: 'user@example.com' })
    ;(mockCreateToken as unknown as Mock).mockResolvedValue({})
    const res = await requestReset(makeReq('http://localhost/api/auth/reset-password', { email: 'user@example.com' }))
    expect(res.status).toBe(200)
    expect(mockSendReset).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringContaining('/account/reset-password/'),
    )
  })
})

describe('POST /api/auth/reset-password/[token] (confirm)', () => {
  beforeEach(() => {
    ;(mockFindManyTokens as unknown as Mock).mockReset()
    ;(mockUpdateToken as unknown as Mock).mockReset()
    ;(mockUpdateUser as unknown as Mock).mockReset()
  })

  it('returns 400 for invalid or expired token', async () => {
    ;(mockFindManyTokens as unknown as Mock).mockResolvedValue([])
    vi.mocked(verifyPassword).mockResolvedValue(false)

    const res = await confirmReset(
      makeReq('http://localhost/api/auth/reset-password/badtoken', { password: 'newpass123' }),
      { params: Promise.resolve({ token: 'badtoken' }) },
    )
    expect(res.status).toBe(400)
  })

  it('returns 200 and updates password for a valid token', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000)
    ;(mockFindManyTokens as unknown as Mock).mockResolvedValue([{
      id: 'token-1',
      userId: 'user-1',
      token: 'hashed_token',
      expiresAt: futureDate,
      usedAt: null,
    }])
    vi.mocked(verifyPassword).mockResolvedValue(true)
    ;(mockUpdateUser as unknown as Mock).mockResolvedValue({})
    ;(mockUpdateToken as unknown as Mock).mockResolvedValue({})

    const res = await confirmReset(
      makeReq('http://localhost/api/auth/reset-password/plaintoken', { password: 'newpass123' }),
      { params: Promise.resolve({ token: 'plaintoken' }) },
    )
    expect(res.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalled()
    expect(mockUpdateToken).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ usedAt: expect.any(Date) }) }),
    )
  })
})
