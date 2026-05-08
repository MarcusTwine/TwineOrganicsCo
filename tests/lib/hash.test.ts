import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/hash'

describe('hashPassword', () => {
  it('returns a bcrypt hash different from the input', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).not.toBe('secret123')
    expect(hash).toMatch(/^\$2[ab]\$/)
  })
})

describe('verifyPassword', () => {
  it('returns true for a matching password', async () => {
    const hash = await hashPassword('secret123')
    const result = await verifyPassword('secret123', hash)
    expect(result).toBe(true)
  })

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('secret123')
    const result = await verifyPassword('wrong', hash)
    expect(result).toBe(false)
  })
})
