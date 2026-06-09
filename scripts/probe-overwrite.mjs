import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const p = 'shoes02/__dup_test__.png'

await sb.storage.from('products').remove([p])
const up1 = await sb.storage.from('products').upload(p, png, { upsert: false, contentType: 'image/png' })
console.log('first', up1.error?.message || 'OK')

const up2 = await sb.storage.from('products').upload(p, png, { upsert: true, contentType: 'image/png' })
console.log('upsert', up2.error?.message || 'OK')

const rm = await sb.storage.from('products').remove([p])
console.log('remove', rm.error?.message || 'OK', 'count', rm.data?.length ?? 0)

const up3 = await sb.storage.from('products').upload(p, png, { upsert: false, contentType: 'image/png' })
console.log('after_remove', up3.error?.message || 'OK')

await sb.storage.from('products').remove([p])
