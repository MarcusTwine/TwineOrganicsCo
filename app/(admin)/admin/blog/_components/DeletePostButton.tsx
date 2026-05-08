'use client'

import { deletePost } from '../actions'

export default function DeletePostButton({ id }: { id: string }) {
  return (
    <form action={deletePost.bind(null, id)}>
      <button
        type="submit"
        className="text-red-600 hover:underline"
        onClick={(e) => { if (!confirm('Delete this post?')) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
