import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockPostCreate, mockPostUpdate, mockPostDelete, mockTagUpsert } = vi.hoisted(() => ({
  mockPostCreate: vi.fn(),
  mockPostUpdate: vi.fn(),
  mockPostDelete: vi.fn(),
  mockTagUpsert: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    post: {
      create: mockPostCreate,
      update: mockPostUpdate,
      delete: mockPostDelete,
    },
    postTag: {
      upsert: mockTagUpsert,
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createPost, updatePost, deletePost } from '@/app/(admin)/admin/blog/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('createPost', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await createPost({ error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
    expect(mockPostCreate).not.toHaveBeenCalled()
  })

  it('returns error when title missing', async () => {
    const fd = new FormData()
    const result = await createPost({ error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })

  it('creates post with DRAFT status by default', async () => {
    mockPostCreate.mockResolvedValue({ id: 'post1' })
    const fd = new FormData()
    fd.set('title', 'Test Post')
    fd.set('content', JSON.stringify({ type: 'doc', content: [] }))
    fd.set('slug', 'test-post')
    fd.set('status', 'DRAFT')
    fd.set('tags', JSON.stringify([]))
    const result = await createPost({ error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockPostCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ title: 'Test Post', status: 'DRAFT' }),
    }))
  })

  it('sets publishedAt when status is PUBLISHED', async () => {
    mockPostCreate.mockResolvedValue({ id: 'post1' })
    const fd = new FormData()
    fd.set('title', 'Published Post')
    fd.set('content', JSON.stringify({ type: 'doc', content: [] }))
    fd.set('slug', 'published-post')
    fd.set('status', 'PUBLISHED')
    fd.set('tags', JSON.stringify([]))
    await createPost({ error: '', success: false }, fd)
    const call = mockPostCreate.mock.calls[0][0]
    expect(call.data.publishedAt).toBeInstanceOf(Date)
  })
})

describe('deletePost', () => {
  it('hard-deletes the post', async () => {
    mockPostDelete.mockResolvedValue({})
    await deletePost('post1')
    expect(mockPostDelete).toHaveBeenCalledWith({ where: { id: 'post1' } })
  })
})
