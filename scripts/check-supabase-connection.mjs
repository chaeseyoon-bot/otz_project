/**
 * Verifies .env Supabase values: detects hidden whitespace/quotes, decodes the
 * anon JWT (ref/role/exp), and pings the project. Writes scripts/connection-report.json.
 * Run: node scripts/check-supabase-connection.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'connection-report.json')

function rawEnvLines() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return {}
  const out = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

function inspectValue(raw) {
  if (raw == null) return { present: false }
  const trimmed = raw.trim().replace(/^["']|["']$/g, '').trim()
  return {
    present: true,
    rawLength: raw.length,
    cleanLength: trimmed.length,
    hadLeadingOrTrailingSpace: raw !== raw.trim(),
    hadWrappingQuotes: /^["'].*["']$/.test(raw.trim()),
    hasInnerWhitespace: /\s/.test(trimmed),
    value: trimmed,
  }
}

function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return {
      ref: json.ref,
      role: json.role,
      iss: json.iss,
      expiresAt: json.exp ? new Date(json.exp * 1000).toISOString() : null,
      expired: json.exp ? json.exp * 1000 < Date.now() : null,
    }
  } catch (e) {
    return { error: String(e.message || e) }
  }
}

const env = rawEnvLines()
const url = inspectValue(env.VITE_SUPABASE_URL)
const key = inspectValue(env.VITE_SUPABASE_ANON_KEY)

const report = {
  url: { ...url, value: url.value },
  anonKey: {
    present: key.present,
    rawLength: key.rawLength,
    cleanLength: key.cleanLength,
    hadLeadingOrTrailingSpace: key.hadLeadingOrTrailingSpace,
    hadWrappingQuotes: key.hadWrappingQuotes,
    hasInnerWhitespace: key.hasInnerWhitespace,
    segments: key.value ? key.value.split('.').length : 0,
    decoded: key.value ? decodeJwt(key.value) : null,
  },
  checks: {},
}

const urlRef = (url.value || '').match(/^https:\/\/([a-z0-9-]+)\.supabase\./i)?.[1] ?? null
report.checks.urlFormatOk = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(url.value || '')
report.checks.jwtStructureOk = report.anonKey.segments === 3
report.checks.refMatches = urlRef && report.anonKey.decoded?.ref === urlRef

const reportAndExit = () => {
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
  process.stdout.write(`wrote ${OUT}\n`)
}

if (!url.value || !key.value) {
  report.checks.connection = 'skipped (missing values)'
  reportAndExit()
} else {
  const supabase = createClient(url.value, key.value, { auth: { persistSession: false } })
  const { error } = await supabase.from('products').select('id', { count: 'exact', head: true })
  report.checks.connection = error
    ? { ok: false, message: error.message, code: error.code ?? null, hint: error.hint ?? null }
    : { ok: true, message: 'Reached project and queried products.' }
  reportAndExit()
}
