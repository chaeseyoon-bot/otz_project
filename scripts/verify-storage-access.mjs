/**
 * Storage 권한 진단 — upsert / remove / insert 테스트
 * Run: node scripts/verify-storage-access.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const v = m[2].trim().replace(/^["']|["']$/g, '')
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
}

loadEnv()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
)

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const testPath = `shoes02/__storage_policy_probe_${Date.now()}.png`
const bucket = supabase.storage.from('products')

async function step(label, fn) {
  const result = await fn()
  const error = result?.error?.message ?? null
  const ok = !result?.error
  console.log(`${ok ? 'OK' : 'FAIL'}  ${label}${error ? ` — ${error}` : ''}`)
  if (result?.data && 'path' in (result.data ?? {})) {
    console.log(`      path: ${result.data.path}`)
  }
  if (Array.isArray(result?.data)) {
    console.log(`      removed: ${result.data.length}`)
  }
  return { ok, error }
}

console.log('Project:', process.env.VITE_SUPABASE_URL)
console.log('Test path:', testPath)
console.log('---')

const insert = await step('INSERT (new file)', () =>
  bucket.upload(testPath, png, { upsert: false, contentType: 'image/png' }),
)

const upsert = await step('UPDATE via upsert (overwrite)', () =>
  bucket.upload(testPath, png, { upsert: true, contentType: 'image/png' }),
)

const remove = await step('DELETE (remove)', () => bucket.remove([testPath]))

const insertAgain = await step('INSERT after delete', () =>
  bucket.upload(testPath, png, { upsert: false, contentType: 'image/png' }),
)

await bucket.remove([testPath])

console.log('---')
if (insert.ok && upsert.ok && remove.ok) {
  console.log('모든 Storage 권한이 정상입니다. 어드민 이미지 수정이 가능해야 합니다.')
} else if (insert.ok && !upsert.ok) {
  console.log('UPDATE 정책이 없습니다. SQL Editor에서 admin-storage-policies.sql 을 실행하세요.')
} else if (!remove.ok || (remove.data && remove.data.length === 0 && insert.ok)) {
  console.log('DELETE 정책이 없거나 동작하지 않습니다. admin-storage-policies.sql 을 실행하세요.')
} else {
  console.log('Storage 정책을 점검해 주세요. scripts/sql/admin-storage-policies.sql 실행 필요.')
}

process.exit(insert.ok && upsert.ok ? 0 : 1)
