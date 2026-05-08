'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
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
    immediatelyRender: false,
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
      )
    }
  }, [value, editor, outputFormat])

  if (!editor) return null

  const e = editor

  return (
    <div className="rounded-md border border-gray-300 overflow-hidden">
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
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
