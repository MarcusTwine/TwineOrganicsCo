import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir, readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const cwd = process.cwd()
  const uploadRoot = join(cwd, 'public', 'uploads')
  let files: Record<string, string[]> = {}
  try {
    const folders = await readdir(uploadRoot)
    for (const folder of folders) {
      files[folder] = await readdir(join(uploadRoot, folder)).catch(() => [])
    }
  } catch {
    files = { error: ['uploads directory not readable'] }
  }
  return NextResponse.json({ cwd, uploadRoot, files })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
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
  const filePath = join(uploadDir, filename)

  console.log('[upload] cwd:', process.cwd())
  console.log('[upload] saving to:', filePath)

  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))
    console.log('[upload] saved OK:', filePath)
  } catch (err) {
    console.error('[upload] write failed:', err)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }

  const url = `/uploads/${folder}/${filename}`
  console.log('[upload] returning url:', url)
  return NextResponse.json({ url })
}
