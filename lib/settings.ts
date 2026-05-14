import { db } from '@/lib/db'

/**
 * Read a single site setting from DB.
 * Returns null if not set.
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.siteSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

/**
 * Read multiple site settings in one query.
 * Returns a Record with only the keys that exist in the DB.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

/**
 * Upsert a single site setting.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}

/**
 * Upsert many settings at once.
 */
export async function setSettings(entries: Record<string, string>): Promise<void> {
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  )
}
