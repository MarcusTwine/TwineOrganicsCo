import type { Metadata } from 'next'
import BlogForm from '../_components/BlogForm'

export const metadata: Metadata = { title: 'New Post' }

export default function NewBlogPostPage() {
  return <BlogForm />
}
