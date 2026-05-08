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
