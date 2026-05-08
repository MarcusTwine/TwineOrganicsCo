import { vi } from 'vitest'
import '@testing-library/jest-dom'

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(),
    }),
  ),
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(),
      forEach: vi.fn(),
    }),
  ),
  draftMode: vi.fn(() =>
    Promise.resolve({
      isEnabled: false,
      enable: vi.fn(),
      disable: vi.fn(),
    }),
  ),
}))
