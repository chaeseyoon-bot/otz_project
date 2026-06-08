import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Normalizes a Vite env value: trims whitespace and strips accidental wrapping
 * quotes that can sneak in when copy-pasting keys into `.env`.
 */
function readEnv(name: string): string {
  const raw = import.meta.env[name as keyof ImportMetaEnv] as string | undefined
  if (typeof raw !== 'string') return ''
  return raw.trim().replace(/^["']|["']$/g, '').trim()
}

const supabaseUrl = readEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY')

/** Basic shape checks so misconfigured keys fail loudly (console) instead of silently. */
function validateConfig(url: string, key: string): string[] {
  const problems: string[] = []
  if (!url) {
    problems.push('VITE_SUPABASE_URL is missing.')
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(url)) {
    problems.push(`VITE_SUPABASE_URL looks malformed: "${url}" (expected https://<ref>.supabase.co).`)
  }

  if (!key) {
    problems.push('VITE_SUPABASE_ANON_KEY is missing.')
  } else if (key.split('.').length !== 3) {
    problems.push('VITE_SUPABASE_ANON_KEY is not a valid JWT (expected 3 dot-separated segments).')
  } else if (/\s/.test(key)) {
    problems.push('VITE_SUPABASE_ANON_KEY contains whitespace — re-copy the key without line breaks.')
  }

  return problems
}

const configProblems = validateConfig(supabaseUrl, supabaseAnonKey)
if (configProblems.length > 0) {
  console.error(
    ['[supabase] Invalid configuration in .env:', ...configProblems.map((p) => `  - ${p}`)].join('\n'),
  )
}

/** True only when both env values are present and structurally valid. */
export const isSupabaseConfigured = configProblems.length === 0

/**
 * Single shared client. We pass placeholder-safe values so importing this module
 * never throws and crashes the whole app; runtime calls surface errors instead.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-missing',
  {
    auth: { persistSession: false },
  },
)

/** Lightweight connectivity check usable from the console or a debug screen. */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: configProblems.join(' ') }
  }
  const { error } = await supabase.from('products').select('id', { count: 'exact', head: true })
  if (error) {
    return { ok: false, message: `${error.message} (code: ${error.code ?? 'n/a'})` }
  }
  return { ok: true, message: 'Connected to Supabase.' }
}
