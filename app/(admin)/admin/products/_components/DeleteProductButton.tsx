'use client'

import { deleteProduct } from '../actions'

export default function DeleteProductButton({ id }: { id: string }) {
  return (
    <form action={deleteProduct.bind(null, id)}>
      <button
        type="submit"
        className="text-red-600 hover:underline"
        onClick={(e) => { if (!confirm('Delete this product?')) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
