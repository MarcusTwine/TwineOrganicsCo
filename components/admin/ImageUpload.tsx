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
