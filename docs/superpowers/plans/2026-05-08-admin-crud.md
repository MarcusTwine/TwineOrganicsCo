# Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full CRUD management to the admin panel for Products, Blog, Orders, and Stock.

**Architecture:** Server Actions handle all mutations (co-located `actions.ts` per resource), Server Components handle reads. A shared Tiptap client component handles rich text for both products and blog. All actions verify `ADMIN` role from session before any DB write.

**Tech Stack:** Next.js 16 App Router, Server Actions, Prisma 7, Tiptap, Tailwind v4, Vitest

---

## File Map

**New files:**
```
prisma/schema.prisma                              (modify — add OrderNote, StockAdjustment)
components/admin/RichTextEditor.tsx               (create — Tiptap client component)
components/admin/ImageUpload.tsx                  (create — drag-and-drop uploader client component)
components/admin/TagInput.tsx                     (create — chip tag input client component)
app/api/admin/upload/route.ts                     (create — file upload handler)
app/(admin)/admin/products/actions.ts             (create — createProduct, updateProduct, deleteProduct)
app/(admin)/admin/products/page.tsx               (modify — add Add/Edit/Delete buttons)
app/(admin)/admin/products/new/page.tsx           (create — new product form)
app/(admin)/admin/products/[id]/edit/page.tsx     (create — edit product form)
app/(admin)/admin/blog/actions.ts                 (create — createPost, updatePost, deletePost)
app/(admin)/admin/blog/page.tsx                   (modify — add Add/Edit/Delete buttons)
app/(admin)/admin/blog/new/page.tsx               (create — new blog post form)
app/(admin)/admin/blog/[id]/edit/page.tsx         (create — edit blog post form)
app/(admin)/admin/orders/[id]/page.tsx            (create — order detail + status + notes)
app/(admin)/admin/orders/actions.ts               (create — updateOrderStatus, addOrderNote)
app/(admin)/admin/orders/page.tsx                 (modify — add View link per row)
app/(admin)/admin/stock/[id]/page.tsx             (create — stock adjustment form + history)
app/(admin)/admin/stock/actions.ts                (create — adjustStock)
app/(admin)/admin/stock/page.tsx                  (modify — add Adjust link per row)
tests/admin/products-actions.test.ts              (create)
tests/admin/blog-actions.test.ts                  (create)
tests/admin/orders-actions.test.ts                (create)
tests/admin/stock-actions.test.ts                 (create)
```

---

## Task 1: Schema — Add OrderNote and StockAdjustment models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the two new models and back-relations to schema.prisma**

Open `prisma/schema.prisma` and make the following additions:

Add at the end of the file:
```prisma
model OrderNote {
  id        String   @id @default(cuid())
  orderId   String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  order  Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  author User  @relation(fields: [authorId], references: [id], onDelete: Restrict)
}

model StockAdjustment {
  id        String   @id @default(cuid())
  productId String
  adminId   String
  type      String
  quantity  Int
  reason    String
  note      String?
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  admin   User    @relation(fields: [adminId], references: [id], onDelete: Restrict)
}
```

Add back-relations to existing models:

In `model Order { ... }` add:
```prisma
  notes     OrderNote[]
```

In `model Product { ... }` add:
```prisma
  stockAdjustments StockAdjustment[]
```

In `model User { ... }` add:
```prisma
  orderNotes       OrderNote[]
  stockAdjustments StockAdjustment[]
```

- [ ] **Step 2: Push schema to the database**

```bash
cd /workspace/twine_organics_website/TwineOrganicsCo
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: client regenerated in `app/generated/prisma/`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma app/generated/prisma/
git commit -m "feat: add OrderNote and StockAdjustment schema models"
```

---

## Task 2: Shared Components — RichTextEditor

**Files:**
- Create: `components/admin/RichTextEditor.tsx`

- [ ] **Step 1: Install Tiptap packages**

```bash
cd /workspace/twine_organics_website/TwineOrganicsCo
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-code-block
```

Expected: packages added to node_modules

- [ ] **Step 2: Create RichTextEditor component**

Create `components/admin/RichTextEditor.tsx`:

```tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CodeBlock from '@tiptap/extension-code-block'
import { useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  outputFormat?: 'html' | 'json'
}

const btnClass = 'px-2 py-1 text-sm rounded hover:bg-gray-100 border border-transparent hover:border-gray-300 disabled:opacity-40'
const activeBtnClass = 'bg-gray-200 border-gray-300'

export default function RichTextEditor({ value, onChange, outputFormat = 'html' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock,
    ],
    content: outputFormat === 'json' && value
      ? (() => { try { return JSON.parse(value) } catch { return value } })()
      : value,
    onUpdate({ editor }) {
      onChange(outputFormat === 'json'
        ? JSON.stringify(editor.getJSON())
        : editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor || !value) return
    const current = outputFormat === 'json'
      ? JSON.stringify(editor.getJSON())
      : editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(
        outputFormat === 'json'
          ? (() => { try { return JSON.parse(value) } catch { return value } })()
          : value,
        false,
      )
    }
  }, [value, editor, outputFormat])

  if (!editor) return null

  const e = editor

  return (
    <div className="rounded-md border border-gray-300 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <select
          className="text-sm border border-gray-300 rounded px-1 py-0.5 bg-white"
          onChange={(ev) => {
            const v = ev.target.value
            if (v === 'paragraph') e.chain().focus().setParagraph().run()
            else e.chain().focus().toggleHeading({ level: Number(v) as 1|2|3 }).run()
          }}
          value={
            e.isActive('heading', { level: 1 }) ? '1' :
            e.isActive('heading', { level: 2 }) ? '2' :
            e.isActive('heading', { level: 3 }) ? '3' : 'paragraph'
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <button type="button" onClick={() => e.chain().focus().toggleBold().run()} className={`${btnClass} font-bold ${e.isActive('bold') ? activeBtnClass : ''}`}>B</button>
        <button type="button" onClick={() => e.chain().focus().toggleItalic().run()} className={`${btnClass} italic ${e.isActive('italic') ? activeBtnClass : ''}`}>I</button>
        <button type="button" onClick={() => e.chain().focus().toggleUnderline().run()} className={`${btnClass} underline ${e.isActive('underline') ? activeBtnClass : ''}`}>U</button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" onClick={() => e.chain().focus().setTextAlign('left').run()} className={`${btnClass} ${e.isActive({ textAlign: 'left' }) ? activeBtnClass : ''}`}>≡</button>
        <button type="button" onClick={() => e.chain().focus().setTextAlign('center').run()} className={`${btnClass} ${e.isActive({ textAlign: 'center' }) ? activeBtnClass : ''}`}>≡</button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" onClick={() => e.chain().focus().toggleBulletList().run()} className={`${btnClass} ${e.isActive('bulletList') ? activeBtnClass : ''}`}>•—</button>
        <button type="button" onClick={() => e.chain().focus().toggleOrderedList().run()} className={`${btnClass} ${e.isActive('orderedList') ? activeBtnClass : ''}`}>1.</button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" onClick={() => e.chain().focus().toggleCodeBlock().run()} className={`${btnClass} font-mono ${e.isActive('codeBlock') ? activeBtnClass : ''}`}>&lt;/&gt;</button>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/RichTextEditor.tsx package.json package-lock.json
git commit -m "feat: add shared Tiptap RichTextEditor admin component"
```

---

## Task 3: Shared Components — TagInput and ImageUpload + upload API

**Files:**
- Create: `components/admin/TagInput.tsx`
- Create: `components/admin/ImageUpload.tsx`
- Create: `app/api/admin/upload/route.ts`

- [ ] **Step 1: Create TagInput**

Create `components/admin/TagInput.tsx`:

```tsx
'use client'

import { useState, KeyboardEvent } from 'react'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ value, onChange, placeholder = 'Add tag…' }: Props) {
  const [input, setInput] = useState('')

  function add() {
    const tag = input.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1])
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-gray-300 p-2 focus-within:border-green-500">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          {tag}
          <button type="button" onClick={() => remove(tag)} className="hover:text-red-600 leading-none">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the upload API route**

Create `app/api/admin/upload/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'products'

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'A valid image file is required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` })
}
```

- [ ] **Step 3: Create ImageUpload component**

Create `components/admin/ImageUpload.tsx`:

```tsx
'use client'

import { useRef, useState } from 'react'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  multiple?: boolean
}

export default function ImageUpload({ value, onChange, folder = 'products', multiple = true }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Upload failed')
    return data.url as string
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      const urls = await Promise.all(Array.from(files).map(uploadFile))
      onChange(multiple ? [...value, ...urls] : [urls[0]])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url) => (
            <div key={url} className="relative group">
              <img src={url} alt="" className="h-24 w-24 rounded-md object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading…</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP up to any size</p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/TagInput.tsx components/admin/ImageUpload.tsx app/api/admin/upload/route.ts
git commit -m "feat: add TagInput, ImageUpload components and upload API route"
```

---

## Task 4: Products — Server Actions + Tests

**Files:**
- Create: `app/(admin)/admin/products/actions.ts`
- Create: `tests/admin/products-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/admin/products-actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockProductCreate, mockProductUpdate, mockProductFindUnique } = vi.hoisted(() => ({
  mockProductCreate: vi.fn(),
  mockProductUpdate: vi.fn(),
  mockProductFindUnique: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    product: {
      create: mockProductCreate,
      update: mockProductUpdate,
      findUnique: mockProductFindUnique,
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createProduct, updateProduct, deleteProduct } from '@/app/(admin)/admin/products/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('createProduct', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
    expect(mockProductCreate).not.toHaveBeenCalled()
  })

  it('returns error when required fields missing', async () => {
    const fd = new FormData()
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })

  it('creates product with correct data', async () => {
    mockProductCreate.mockResolvedValue({ id: 'p1' })
    const fd = new FormData()
    fd.set('name', 'Rooibos Tea')
    fd.set('description', '<p>Great tea</p>')
    fd.set('price', '49.99')
    fd.set('stock', '100')
    fd.set('categoryId', 'cat1')
    fd.set('slug', 'rooibos-tea')
    fd.set('isActive', 'true')
    fd.set('isFeatured', 'false')
    fd.set('images', JSON.stringify(['/uploads/products/img.jpg']))
    fd.set('tags', JSON.stringify(['tea', 'organic']))
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockProductCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'Rooibos Tea', price: 49.99, stock: 100 }),
    }))
  })
})

describe('deleteProduct', () => {
  it('soft-deletes by setting isActive = false', async () => {
    mockProductUpdate.mockResolvedValue({})
    await deleteProduct('p1')
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { isActive: false },
    })
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /workspace/twine_organics_website/TwineOrganicsCo
npx vitest run tests/admin/products-actions.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create the actions file**

Create `app/(admin)/admin/products/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export async function createProduct(prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = fd.get('name')?.toString().trim() ?? ''
  const description = fd.get('description')?.toString() ?? ''
  const price = parseFloat(fd.get('price')?.toString() ?? '')
  const stock = parseInt(fd.get('stock')?.toString() ?? '', 10)
  const categoryId = fd.get('categoryId')?.toString() ?? ''
  const slug = fd.get('slug')?.toString().trim() ?? ''
  const isActive = fd.get('isActive') === 'true'
  const isFeatured = fd.get('isFeatured') === 'true'
  const images: string[] = JSON.parse(fd.get('images')?.toString() ?? '[]')
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!name || !slug || !categoryId || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, slug, category, price, and stock are required', success: false }
  }

  try {
    await db.product.create({
      data: { name, description, price, stock, categoryId, slug, isActive, isFeatured, images, tags },
    })
  } catch {
    return { error: 'Failed to create product', success: false }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  redirect('/admin/products')
}

export async function updateProduct(id: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = fd.get('name')?.toString().trim() ?? ''
  const description = fd.get('description')?.toString() ?? ''
  const price = parseFloat(fd.get('price')?.toString() ?? '')
  const stock = parseInt(fd.get('stock')?.toString() ?? '', 10)
  const categoryId = fd.get('categoryId')?.toString() ?? ''
  const slug = fd.get('slug')?.toString().trim() ?? ''
  const isActive = fd.get('isActive') === 'true'
  const isFeatured = fd.get('isFeatured') === 'true'
  const images: string[] = JSON.parse(fd.get('images')?.toString() ?? '[]')
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!name || !slug || !categoryId || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, slug, category, price, and stock are required', success: false }
  }

  try {
    await db.product.update({
      where: { id },
      data: { name, description, price, stock, categoryId, slug, isActive, isFeatured, images, tags },
    })
  } catch {
    return { error: 'Failed to update product', success: false }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  redirect('/admin/products')
}

export async function deleteProduct(id: string): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  await db.product.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/admin/products')
  revalidatePath('/products')
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run tests/admin/products-actions.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/\(admin\)/admin/products/actions.ts tests/admin/products-actions.test.ts
git commit -m "feat: add product server actions with tests"
```

---

## Task 5: Products — List Page (Add/Edit/Delete buttons)

**Files:**
- Modify: `app/(admin)/admin/products/page.tsx`

- [ ] **Step 1: Update the products list page**

Replace the full contents of `app/(admin)/admin/products/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'
import { deleteProduct } from './actions'

export const metadata: Metadata = { title: 'Products' }

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Stock</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                <td className="px-4 py-3 text-right text-gray-900">R{Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-900">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button type="submit" className="text-red-600 hover:underline" onClick={(e) => { if (!confirm('Delete this product?')) e.preventDefault() }}>
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/admin/products/page.tsx
git commit -m "feat: add Add/Edit/Delete actions to products list"
```

---

## Task 6: Products — New and Edit Forms

**Files:**
- Create: `app/(admin)/admin/products/new/page.tsx`
- Create: `app/(admin)/admin/products/[id]/edit/page.tsx`
- Create: `app/(admin)/admin/products/ProductForm.tsx`

- [ ] **Step 1: Create the shared ProductForm client component**

Create `app/(admin)/admin/products/ProductForm.tsx`:

```tsx
'use client'

import { useActionState, useState } from 'react'
import { useEffect } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import TagInput from '@/components/admin/TagInput'
import slugify from 'slugify'

interface Category { id: string; name: string }

interface ProductData {
  id?: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  slug: string
  isActive: boolean
  isFeatured: boolean
  images: string[]
  tags: string[]
}

interface Props {
  categories: Category[]
  initial?: ProductData
  action: (prev: { error: string; success: boolean }, fd: FormData) => Promise<{ error: string; success: boolean }>
}

const empty: ProductData = {
  name: '', description: '', price: 0, stock: 0,
  categoryId: '', slug: '', isActive: true, isFeatured: false,
  images: [], tags: [],
}

export default function ProductForm({ categories, initial = empty, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: '', success: false })
  const [description, setDescription] = useState(initial.description)
  const [images, setImages] = useState<string[]>(initial.images)
  const [tags, setTags] = useState<string[]>(initial.tags)
  const [slug, setSlug] = useState(initial.slug)
  const [name, setName] = useState(initial.name)

  useEffect(() => {
    if (!initial.slug && name) setSlug(slugify(name, { lower: true, strict: true }))
  }, [name, initial.slug])

  return (
    <form action={formAction}>
      {/* Hidden fields for client-managed state */}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />

      <div className="flex gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-6">

          {/* Title */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              placeholder="e.g., Organic Rooibos Tea"
            />
          </div>

          {/* Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <RichTextEditor value={description} onChange={setDescription} outputFormat="html" />
          </div>

          {/* Media */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Media</label>
            <ImageUpload value={images} onChange={setImages} folder="products" multiple />
          </div>

          {/* Price */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initial.price}
                required
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock quantity</label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={initial.stock}
              required
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 space-y-4">

          {/* Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
            <select name="isActive" defaultValue={initial.isActive ? 'true' : 'false'} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
              <input name="isFeatured" type="checkbox" defaultChecked={initial.isFeatured} value="true" className="rounded" />
              Featured
            </label>
            <input type="hidden" name="isFeatured" value="false" />
          </div>

          {/* Organisation */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Organisation</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select name="categoryId" defaultValue={initial.categoryId} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tags</label>
              <TagInput value={tags} onChange={setTags} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Error + Save */}
          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create the New product page**

Create `app/(admin)/admin/products/new/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'
import ProductForm from '../ProductForm'
import { createProduct } from '../actions'

export const metadata: Metadata = { title: 'New Product' }

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-green-700">← Products</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add product</h1>
      </div>
      <ProductForm categories={categories} action={createProduct} />
    </div>
  )
}
```

- [ ] **Step 3: Create the Edit product page**

Create `app/(admin)/admin/products/[id]/edit/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../ProductForm'
import { updateProduct } from '../../actions'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-green-700">← Products</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit product</h1>
      </div>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          slug: product.slug,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images,
          tags: product.tags,
        }}
        action={action}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/admin/products/
git commit -m "feat: add product new/edit forms"
```

---

## Task 7: Blog — Server Actions + Tests

**Files:**
- Create: `app/(admin)/admin/blog/actions.ts`
- Create: `tests/admin/blog-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/admin/blog-actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockPostCreate, mockPostUpdate, mockPostDelete, mockTagFindFirst, mockTagCreate, mockPostToTagCreate } = vi.hoisted(() => ({
  mockPostCreate: vi.fn(),
  mockPostUpdate: vi.fn(),
  mockPostDelete: vi.fn(),
  mockTagFindFirst: vi.fn(),
  mockTagCreate: vi.fn(),
  mockPostToTagCreate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    post: { create: mockPostCreate, update: mockPostUpdate, delete: mockPostDelete },
    postTag: { findFirst: mockTagFindFirst, create: mockTagCreate },
    postToTag: { create: mockPostToTagCreate },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createPost, deletePost } from '@/app/(admin)/admin/blog/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN', name: 'Admin' } }
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

  it('returns error when title is missing', async () => {
    const fd = new FormData()
    const result = await createPost({ error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })

  it('creates draft post when visibility is hidden', async () => {
    mockPostCreate.mockResolvedValue({ id: 'post1' })
    const fd = new FormData()
    fd.set('title', 'My Post')
    fd.set('content', JSON.stringify({ type: 'doc', content: [] }))
    fd.set('excerpt', 'A short excerpt')
    fd.set('slug', 'my-post')
    fd.set('status', 'DRAFT')
    fd.set('tags', JSON.stringify([]))
    const result = await createPost({ error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockPostCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'DRAFT', publishedAt: null }),
    }))
  })
})

describe('deletePost', () => {
  it('hard-deletes the post', async () => {
    mockPostDelete.mockResolvedValue({})
    await deletePost('post1')
    expect(mockPostDelete).toHaveBeenCalledWith({ where: { id: 'post1' } })
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run tests/admin/blog-actions.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create the blog actions file**

Create `app/(admin)/admin/blog/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import slugify from 'slugify'

type State = { error: string; success: boolean }

async function syncTags(postId: string, tagNames: string[]) {
  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true })
    let tag = await db.postTag.findFirst({ where: { slug } })
    if (!tag) tag = await db.postTag.create({ data: { name, slug } })
    await db.postToTag.create({ data: { postId, postTagId: tag.id } }).catch(() => {})
  }
}

export async function createPost(prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const title = fd.get('title')?.toString().trim() ?? ''
  const content = fd.get('content')?.toString() ?? '{}'
  const excerpt = fd.get('excerpt')?.toString().trim() ?? ''
  const slug = fd.get('slug')?.toString().trim() || slugify(title, { lower: true, strict: true })
  const status = fd.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const coverImage = fd.get('coverImage')?.toString() || null
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!title || !excerpt) return { error: 'Title and excerpt are required', success: false }

  let contentJson: object
  try { contentJson = JSON.parse(content) } catch { contentJson = {} }

  try {
    const post = await db.post.create({
      data: {
        title,
        content: contentJson,
        excerpt,
        slug,
        status,
        coverImage,
        authorId: session.user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })
    await syncTags(post.id, tags)
  } catch {
    return { error: 'Failed to create post', success: false }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const title = fd.get('title')?.toString().trim() ?? ''
  const content = fd.get('content')?.toString() ?? '{}'
  const excerpt = fd.get('excerpt')?.toString().trim() ?? ''
  const slug = fd.get('slug')?.toString().trim() ?? ''
  const status = fd.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const coverImage = fd.get('coverImage')?.toString() || null
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!title || !slug || !excerpt) return { error: 'Title, slug, and excerpt are required', success: false }

  let contentJson: object
  try { contentJson = JSON.parse(content) } catch { contentJson = {} }

  try {
    const existing = await db.post.findUnique({ where: { id }, select: { status: true, publishedAt: true } })
    const publishedAt = status === 'PUBLISHED' && existing?.status !== 'PUBLISHED'
      ? new Date()
      : existing?.publishedAt ?? null

    await db.post.update({
      where: { id },
      data: { title, content: contentJson, excerpt, slug, status, coverImage, publishedAt },
    })
    await db.postToTag.deleteMany({ where: { postId: id } })
    await syncTags(id, tags)
  } catch {
    return { error: 'Failed to update post', success: false }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function deletePost(id: string): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  await db.post.delete({ where: { id } })
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run tests/admin/blog-actions.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/\(admin\)/admin/blog/actions.ts tests/admin/blog-actions.test.ts
git commit -m "feat: add blog server actions with tests"
```

---

## Task 8: Blog — List Page + New/Edit Forms

**Files:**
- Modify: `app/(admin)/admin/blog/page.tsx`
- Create: `app/(admin)/admin/blog/PostForm.tsx`
- Create: `app/(admin)/admin/blog/new/page.tsx`
- Create: `app/(admin)/admin/blog/[id]/edit/page.tsx`

- [ ] **Step 1: Update blog list page**

Replace `app/(admin)/admin/blog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'
import { deletePost } from './actions'

export const metadata: Metadata = { title: 'Blog' }

export default async function AdminBlogPage() {
  const posts = await db.post.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <Link href="/admin/blog/new" className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
          Add post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Published</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No posts yet.</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-gray-600">{p.author.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-ZA') : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/blog/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <form action={deletePost.bind(null, p.id)}>
                      <button type="submit" className="text-red-600 hover:underline" onClick={(e) => { if (!confirm('Delete this post?')) e.preventDefault() }}>
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the PostForm client component**

Create `app/(admin)/admin/blog/PostForm.tsx`:

```tsx
'use client'

import { useActionState, useState } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import TagInput from '@/components/admin/TagInput'
import slugify from 'slugify'

interface PostData {
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  coverImage: string | null
  tags: string[]
}

interface Props {
  initial?: PostData
  action: (prev: { error: string; success: boolean }, fd: FormData) => Promise<{ error: string; success: boolean }>
}

const empty: PostData = {
  title: '', content: '', excerpt: '', slug: '',
  status: 'DRAFT', coverImage: null, tags: [],
}

export default function PostForm({ initial = empty, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: '', success: false })
  const [content, setContent] = useState(initial.content)
  const [coverImage, setCoverImage] = useState<string[]>(initial.coverImage ? [initial.coverImage] : [])
  const [tags, setTags] = useState<string[]>(initial.tags)
  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)

  function onTitleChange(v: string) {
    setTitle(v)
    if (!initial.slug) setSlug(slugify(v, { lower: true, strict: true }))
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="coverImage" value={coverImage[0] ?? ''} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />

      <div className="flex gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              placeholder="e.g., The benefits of rooibos"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <RichTextEditor value={content} onChange={setContent} outputFormat="json" />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              required
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none"
              placeholder="A short summary shown on the blog listing page"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Visibility</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input type="radio" name="status" value="PUBLISHED" defaultChecked={initial.status === 'PUBLISHED'} className="accent-green-700" />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="status" value="DRAFT" defaultChecked={initial.status !== 'PUBLISHED'} className="accent-green-700" />
              Hidden
            </label>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cover image</h3>
            <ImageUpload value={coverImage} onChange={setCoverImage} folder="blog" multiple={false} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Organisation</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tags</label>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save post'}
          </button>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create new post page**

Create `app/(admin)/admin/blog/new/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import PostForm from '../PostForm'
import { createPost } from '../actions'

export const metadata: Metadata = { title: 'New Post' }

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm text-gray-500 hover:text-green-700">← Blog</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add blog post</h1>
      </div>
      <PostForm action={createPost} />
    </div>
  )
}
```

- [ ] **Step 4: Create edit post page**

Create `app/(admin)/admin/blog/[id]/edit/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostForm from '../../PostForm'
import { updatePost } from '../../actions'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Post' }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = await db.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })
  if (!post) notFound()

  const action = updatePost.bind(null, id)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm text-gray-500 hover:text-green-700">← Blog</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit post</h1>
      </div>
      <PostForm
        initial={{
          title: post.title,
          content: JSON.stringify(post.content),
          excerpt: post.excerpt,
          slug: post.slug,
          status: post.status,
          coverImage: post.coverImage,
          tags: post.tags.map((t) => t.tag.name),
        }}
        action={action}
      />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(admin\)/admin/blog/
git commit -m "feat: add blog list updates and new/edit post forms"
```

---

## Task 9: Orders — Detail Page + Actions + Tests

**Files:**
- Modify: `app/(admin)/admin/orders/page.tsx`
- Create: `app/(admin)/admin/orders/[id]/page.tsx`
- Create: `app/(admin)/admin/orders/actions.ts`
- Create: `tests/admin/orders-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/admin/orders-actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockOrderUpdate, mockOrderNoteCreate } = vi.hoisted(() => ({
  mockOrderUpdate: vi.fn(),
  mockOrderNoteCreate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    order: { update: mockOrderUpdate },
    orderNote: { create: mockOrderNoteCreate },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { updateOrderStatus, addOrderNote } from '@/app/(admin)/admin/orders/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('updateOrderStatus', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const result = await updateOrderStatus('o1', 'PAID')
    expect(result?.error).toBe('Forbidden')
    expect(mockOrderUpdate).not.toHaveBeenCalled()
  })

  it('updates the order status', async () => {
    mockOrderUpdate.mockResolvedValue({})
    await updateOrderStatus('o1', 'SHIPPED')
    expect(mockOrderUpdate).toHaveBeenCalledWith({ where: { id: 'o1' }, data: { status: 'SHIPPED' } })
  })
})

describe('addOrderNote', () => {
  it('creates a note with the admin user id', async () => {
    mockOrderNoteCreate.mockResolvedValue({})
    await addOrderNote('o1', 'Contacted customer about delay')
    expect(mockOrderNoteCreate).toHaveBeenCalledWith({
      data: { orderId: 'o1', authorId: 'u1', body: 'Contacted customer about delay' },
    })
  })

  it('does nothing when body is empty', async () => {
    await addOrderNote('o1', '  ')
    expect(mockOrderNoteCreate).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run tests/admin/orders-actions.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create orders actions**

Create `app/(admin)/admin/orders/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED'

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error: string } | void> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' }

  await db.order.update({ where: { id: orderId }, data: { status } })
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
}

export async function addOrderNote(orderId: string, body: string): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return
  if (!body.trim()) return

  await db.orderNote.create({
    data: { orderId, authorId: session.user.id, body: body.trim() },
  })
  revalidatePath(`/admin/orders/${orderId}`)
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run tests/admin/orders-actions.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Update orders list page to add View links**

Replace `app/(admin)/admin/orders/page.tsx` — add `<Link>` in the last column and an "Actions" header:

Add this import at the top:
```tsx
import Link from 'next/link'
```

Change the last `<th>` from `Items` to:
```tsx
<th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
```

Change the last `<td>` to:
```tsx
<td className="px-4 py-3 text-right">
  <div className="flex items-center justify-end gap-3">
    <span className="text-gray-600">{o.items.length} items</span>
    <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline">View</Link>
  </div>
</td>
```

- [ ] **Step 6: Create the order detail page**

Create `app/(admin)/admin/orders/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateOrderStatus, addOrderNote } from '../actions'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Order Detail' }

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'] as const
const statusColour: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800', DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600', FAILED: 'bg-red-100 text-red-800',
}

type DeliveryAddress = { fullName: string; addressLine1: string; city: string; province: string; postalCode: string; phone: string }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, slug: true } } } },
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!order) notFound()

  const address = order.deliveryAddress as DeliveryAddress
  const shortId = order.id.slice(-8).toUpperCase()

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-green-700">← Orders</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Order #{shortId}</h1>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[order.status]}`}>
          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Left — order details */}
        <div className="flex-1 space-y-6">
          {/* Customer */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 font-medium text-gray-900">Customer</h2>
            <p className="text-sm text-gray-900">{order.user.name}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
          </div>

          {/* Delivery address */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 font-medium text-gray-900">Delivery address</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {address.fullName}<br />
              {address.addressLine1}<br />
              {address.city}, {address.province} {address.postalCode}<br />
              {address.phone}
            </p>
          </div>

          {/* Items */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">R{Number(item.priceAtPurchase).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">R{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Order total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 text-base">R{Number(order.total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Internal notes */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-medium text-gray-900">Internal notes</h2>
            {order.notes.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">No notes yet.</p>
            ) : (
              <ul className="mb-4 space-y-3">
                {order.notes.map((note) => (
                  <li key={note.id} className="rounded-md bg-gray-50 p-3 text-sm">
                    <p className="text-gray-900">{note.body}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {note.author.name} · {new Date(note.createdAt).toLocaleString('en-ZA')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form action={async (fd: FormData) => {
              'use server'
              await addOrderNote(id, fd.get('body')?.toString() ?? '')
            }}>
              <textarea name="body" rows={3} placeholder="Add a note…" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:border-green-500 focus:outline-none" />
              <button type="submit" className="mt-2 rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-900">
                Add note
              </button>
            </form>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Update status</h3>
            <form action={async (fd: FormData) => {
              'use server'
              await updateOrderStatus(id, fd.get('status') as 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED')
            }}>
              <select name="status" defaultValue={order.status} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-3">
                {statuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <button type="submit" className="w-full rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
                Update status
              </button>
            </form>
          </div>

          {order.peachPaymentId && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-1 text-sm font-medium text-gray-700">Payment ID</h3>
              <p className="font-mono text-xs text-gray-500 break-all">{order.peachPaymentId}</p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-1 text-sm font-medium text-gray-700">Placed</h3>
            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(admin\)/admin/orders/ tests/admin/orders-actions.test.ts
git commit -m "feat: add order detail page, status update, and notes"
```

---

## Task 10: Stock — Adjustment Page + Actions + Tests

**Files:**
- Modify: `app/(admin)/admin/stock/page.tsx`
- Create: `app/(admin)/admin/stock/[id]/page.tsx`
- Create: `app/(admin)/admin/stock/actions.ts`
- Create: `tests/admin/stock-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/admin/stock-actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockProductUpdate, mockProductFindUnique, mockAdjustmentCreate } = vi.hoisted(() => ({
  mockProductUpdate: vi.fn(),
  mockProductFindUnique: vi.fn(),
  mockAdjustmentCreate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    product: { update: mockProductUpdate, findUnique: mockProductFindUnique },
    stockAdjustment: { create: mockAdjustmentCreate },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { adjustStock } from '@/app/(admin)/admin/stock/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
  mockProductFindUnique.mockResolvedValue({ id: 'p1', stock: 10 })
})

describe('adjustStock', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await adjustStock('p1', { error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
  })

  it('returns error for invalid quantity', async () => {
    const fd = new FormData()
    fd.set('type', 'ADD')
    fd.set('quantity', '0')
    fd.set('reason', 'RESTOCK')
    const result = await adjustStock('p1', { error: '', success: false }, fd)
    expect(result.error).toMatch(/positive/)
  })

  it('adds stock correctly', async () => {
    mockProductUpdate.mockResolvedValue({})
    mockAdjustmentCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('type', 'ADD')
    fd.set('quantity', '5')
    fd.set('reason', 'RESTOCK')
    fd.set('note', '')
    await adjustStock('p1', { error: '', success: false }, fd)
    expect(mockProductUpdate).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stock: 15 } })
    expect(mockAdjustmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'ADD', quantity: 5, reason: 'RESTOCK', adminId: 'u1' }),
    }))
  })

  it('removes stock and floors at 0', async () => {
    mockProductFindUnique.mockResolvedValue({ id: 'p1', stock: 3 })
    mockProductUpdate.mockResolvedValue({})
    mockAdjustmentCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('type', 'REMOVE')
    fd.set('quantity', '10')
    fd.set('reason', 'DAMAGED')
    fd.set('note', '')
    await adjustStock('p1', { error: '', success: false }, fd)
    expect(mockProductUpdate).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { stock: 0 } })
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run tests/admin/stock-actions.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create stock actions**

Create `app/(admin)/admin/stock/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export async function adjustStock(productId: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const type = fd.get('type')?.toString() === 'ADD' ? 'ADD' : 'REMOVE'
  const quantity = parseInt(fd.get('quantity')?.toString() ?? '', 10)
  const reason = fd.get('reason')?.toString() ?? ''
  const note = fd.get('note')?.toString().trim() || null

  if (!quantity || quantity <= 0) return { error: 'Quantity must be a positive number', success: false }
  if (!reason) return { error: 'Reason is required', success: false }

  const product = await db.product.findUnique({ where: { id: productId }, select: { stock: true } })
  if (!product) return { error: 'Product not found', success: false }

  const newStock = type === 'ADD'
    ? product.stock + quantity
    : Math.max(0, product.stock - quantity)

  await db.product.update({ where: { id: productId }, data: { stock: newStock } })
  await db.stockAdjustment.create({
    data: { productId, adminId: session.user.id, type, quantity, reason, note },
  })

  revalidatePath('/admin/stock')
  revalidatePath(`/admin/stock/${productId}`)
  redirect('/admin/stock')
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run tests/admin/stock-actions.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Update stock list page to add Adjust links**

Replace `app/(admin)/admin/stock/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Stock' }

export default async function AdminStockPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, stock: true },
    orderBy: { stock: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Stock Levels</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Units in Stock</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Alert</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className={p.stock <= 5 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  {p.stock === 0 && <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Out of stock</span>}
                  {p.stock > 0 && p.stock <= 5 && <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Low stock</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/stock/${p.id}`} className="text-blue-600 hover:underline">Adjust</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create the stock adjustment page**

Create `app/(admin)/admin/stock/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adjustStock } from '../actions'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Adjust Stock' }

const reasons = ['RESTOCK', 'SALE', 'DAMAGED', 'CORRECTION', 'OTHER'] as const

export default async function StockAdjustPage({ params }: Props) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true, name: true, stock: true,
      category: { select: { name: true } },
      stockAdjustments: {
        include: { admin: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
  if (!product) notFound()

  const action = adjustStock.bind(null, id)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/stock" className="text-sm text-gray-500 hover:text-green-700">← Stock</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Adjust Stock</h1>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Product header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{product.category.name}</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">{product.name}</h2>
            <p className="mt-3 text-4xl font-bold text-gray-900">{product.stock} <span className="text-lg font-normal text-gray-500">units in stock</span></p>
          </div>

          {/* Adjustment form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-medium text-gray-900">New adjustment</h2>
            <form action={action} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="type" value="ADD" defaultChecked className="accent-green-700" /> Add stock
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="type" value="REMOVE" className="accent-green-700" /> Remove stock
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input name="quantity" type="number" min="1" required className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select name="reason" required className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm">
                  {reasons.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea name="note" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:border-green-500 focus:outline-none" />
              </div>
              <button type="submit" className="rounded-md bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">
                Save adjustment
              </button>
            </form>
          </div>

          {/* History */}
          {product.stockAdjustments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-medium text-gray-900">Adjustment history</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Reason</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Note</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.stockAdjustments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{new Date(a.createdAt).toLocaleDateString('en-ZA')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${a.type === 'ADD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.type === 'ADD' ? '+' : '−'}{a.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{a.quantity}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{a.reason.toLowerCase()}</td>
                      <td className="px-4 py-3 text-gray-500">{a.note ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{a.admin.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(admin\)/admin/stock/ tests/admin/stock-actions.test.ts
git commit -m "feat: add stock adjustment page with history and actions"
```

---

## Task 11: Build, Deploy and Smoke Test

- [ ] **Step 1: Run all tests**

```bash
cd /workspace/twine_organics_website/TwineOrganicsCo
npx vitest run
```

Expected: all tests pass

- [ ] **Step 2: Build locally to catch type errors**

```bash
npm run build
```

Expected: build succeeds with no errors

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Deploy to server**

```bash
sshpass -p 'P@ssword' ssh -p 26 -o StrictHostKeyChecking=no root@192.168.0.101 \
  "cd /var/www/twine-organics && git pull && npm install && npx prisma db push && npm run build && pm2 restart twine-organics"
```

Expected: PM2 shows `online`

- [ ] **Step 5: Smoke test all admin routes**

```bash
sshpass -p 'P@ssword' ssh -p 26 -o StrictHostKeyChecking=no root@192.168.0.101 \
  "for p in /admin /admin/products /admin/products/new /admin/blog /admin/blog/new /admin/orders /admin/stock; do
    echo \"\$(curl -s -o /dev/null -w '%{http_code}') \$p\"
  done"
```

Expected: all return `307` (redirect to login — correct for unauthenticated curl)
