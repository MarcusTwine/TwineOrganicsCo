'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import TagInput from '@/components/admin/TagInput'
import { createProduct, updateProduct } from '../actions'

interface Category { id: string; name: string }
interface Product {
  id: string; name: string; description: string; price: number
  stock: number; categoryId: string; slug: string; isActive: boolean; isFeatured: boolean
  images: string[]; tags: string[]
}

interface Props {
  product?: Product
  categories: Category[]
}

const initialState = { error: '', success: false }

export default function ProductForm({ product, categories }: Props) {
  const isEdit = !!product
  const boundAction = isEdit ? updateProduct.bind(null, product.id) : createProduct

  const [state, formAction, pending] = useActionState(boundAction, initialState)

  const [description, setDescription] = useState(product?.description ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [tags, setTags] = useState<string[]>(product?.tags ?? [])
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)

  const price = product?.price ?? ''

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        <Link href="/admin/products" className="text-sm text-gray-600 hover:underline">← Back to products</Link>
      </div>

      {state.error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <form action={formAction}>
        {/* Hidden fields for client-managed state */}
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        <input type="hidden" name="isActive" value={String(isActive)} />
        <input type="hidden" name="isFeatured" value={String(isFeatured)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content — left 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="name"
                  defaultValue={product?.name}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor value={description} onChange={setDescription} outputFormat="html" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                <ImageUpload value={images} onChange={setImages} folder="products" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={price}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={product?.stock ?? 0}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — right 1/3 */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Status</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">Featured</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Organisation</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  name="categoryId"
                  defaultValue={product?.categoryId}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <TagInput value={tags} onChange={setTags} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input
                  name="slug"
                  defaultValue={product?.slug}
                  placeholder="auto-generated from title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-green-700 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
