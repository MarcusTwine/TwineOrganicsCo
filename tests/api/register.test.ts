import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/db', () => {
  const mockUserCreate = vi.fn()
  const mockUserFindUnique = vi.fn()
  return {
    db: {
      user: {
        findUnique: mockUserFindUnique,
        create: mockUserCreate,
      },
    },
  }
})

vi.mock('@/lib/hash', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_pw'),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/hash'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.mocked(db.user.findUnique).mockReset()
    vi.mocked(db.user.create).mockReset()
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already exists', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'existing' } as any)
    const res = await POST(
      makeRequest({ name: 'Alice', email: 'a@b.com', password: 'pass123' }),
    )
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/already/i)
  })

  it('creates user and returns 201 on valid input', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue({ id: 'new-id', name: 'Alice', email: 'a@b.com' } as any)
    const res = await POST(
      makeRequest({ name: 'Alice', email: 'a@b.com', password: 'pass123' }),
    )
    expect(res.status).toBe(201)
    expect(vi.mocked(db.user.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Alice',
          email: 'a@b.com',
          hashedPassword: 'hashed_pw',
          role: 'CUSTOMER',
        }),
      }),
    )
  })
})
