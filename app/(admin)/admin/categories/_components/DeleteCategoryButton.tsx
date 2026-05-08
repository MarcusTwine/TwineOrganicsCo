'use client'

import { deleteCategory } from '../actions'

export default function DeleteCategoryButton({ id }: { id: string }) {
  return (
    <form action={deleteCategory.bind(null, id)}>
      <button
        type="submit"
        className="text-sm text-red-600 hover:underline"
        onClick={(e) => { if (!confirm('Delete this category?')) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
