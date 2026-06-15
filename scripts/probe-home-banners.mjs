import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'home-banners-probe.json')

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
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

const report = { home_banners: [], homepage_banners: [] }

const homeCandidates = [
  { title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png' },
  { title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png', cta_link: '/' },
  { title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png', link_href: '/' },
  { title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png', href: '/' },
  { main_title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png' },
  { banner_title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png' },
]

for (const payload of homeCandidates) {
  const { data, error } = await supabase.from('home_banners').insert(payload).select('*')
  report.home_banners.push({ payload, error: error?.message, code: error?.code, data })
}

const { data: homeRows } = await supabase.from('home_banners').select('*').limit(1)
report.home_banners_sample = homeRows

const { data: hpRows, error: hpSelectError } = await supabase.from('homepage_banners').select('*').limit(1)
report.homepage_banners_select = { error: hpSelectError?.message, rows: hpRows }

const hpCandidates = [
  { title: 't', subtitle: 's', cta_label: 'c', image_url: 'https://example.com/x.png' },
  { image_url: 'https://example.com/x.png' },
]
for (const payload of hpCandidates) {
  const { data, error } = await supabase.from('homepage_banners').insert(payload).select('*')
  report.homepage_banners.push({ payload, error: error?.message, code: error?.code, data })
}

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
process.stdout.write(`wrote ${OUT}\n`)
