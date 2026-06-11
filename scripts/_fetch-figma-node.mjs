import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const envPath = path.join(ROOT, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m || process.env[m[1]] !== undefined) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}

const nodeId = process.argv[2] || '2898:5238'
const token = process.env.FIGMA_ACCESS_TOKEN || process.env.VITE_FIGMA_ACCESS_TOKEN
const fileKey = process.env.FIGMA_FILE_KEY || '3bBi5a4TlJxUjdrFmkgp0e'

if (!token) {
  console.log('NO_TOKEN')
  process.exit(1)
}

const res = await fetch(
  `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
  { headers: { 'X-Figma-Token': token } },
)
const json = await res.json()
const outPath = path.join(ROOT, 'scripts', '_figma-node-output.json')
fs.writeFileSync(outPath, JSON.stringify(json, null, 2))
console.log('WROTE', outPath)
console.log('status', res.status)
