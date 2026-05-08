'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import TagInput from '@/components/admin/TagInput'
import { createPost, updatePost } from '../actions'

interface PostTag { tag: { name: string } }
interface Post {
  id: string
  title: string
  slug: string
  content: unknown
  excerpt: string | null
  coverImage: string | null
  status: string
  publishedAt: Date | null
  tags: PostTag[]
}

interface Props {
  post?: Post
}

const initialState = { error: '', success: false }

export default function BlogForm({ post }: Props) {
  const isEdit = !!post
  const boundAction = isEdit ? updatePost.bind(null, post.id) : createPost
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  const [content, setContent] = useState(
    post?.content ? JSON.stringify(post.content) : ''
  )
  const [coverImages, setCoverImages] = useState<string[]>(post?.coverImage ? [post.coverImage] : [])
  const [tags, setTags] = useState<string[]>(post?.tags.map((t) => t.tag.name) ?? [])
  const [status, setStatus] = useState(post?.status ?? 'DRAFT')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <Link href="/admin/blog" className="text-sm text-gray-600 hover:underline">← Back to posts</Link>
      </div>

      {state.error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <form action={formAction}>
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="coverImage" value={coverImages[0] ?? ''} />
        <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        <input type="hidden" name="status" value={status} />
        {post?.publishedAt && (
          <input type="hidden" name="existingPublishedAt" value={post.publishedAt.toISOString()} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  defaultValue={post?.title}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor value={content} onChange={setContent} outputFormat="json" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  name="excerpt"
                  defaultValue={post?.excerpt ?? ''}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Visibility</h2>
              {['DRAFT', 'PUBLISHED'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="text-green-600"
                  />
                  <span className="text-sm text-gray-700">{s === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                </label>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Cover Image</h2>
              <ImageUpload value={coverImages} onChange={setCoverImages} folder="blog" multiple={false} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Organisation</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input
                  name="slug"
                  defaultValue={post?.slug}
                  placeholder="auto-generated from title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <TagInput value={tags} onChange={setTags} />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-green-700 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
