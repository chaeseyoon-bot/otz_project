/**
 * Offline placeholders for `public/assets/figma/shoes/detail_{product}_{still}_big.webp`.
 * Run: `node scripts/seed-shoes-placeholders.mjs`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'assets', 'figma', 'shoes')

const PRODUCT_NUMS = Array.from({ length: 18 }, (_, i) => i + 1)
const STILLS = ['01', '02', '03', '04', '05', '06', '07', '08']

async function main() {
  const res = await fetch('https://placehold.co/800x1200/eeeeee/6b6b6b/png?text=OTZ+Shoes')
  if (!res.ok) throw new Error(`Placeholder fetch failed: ${res.status}`)
  const bytes = Buffer.from(await res.arrayBuffer())

  fs.mkdirSync(outDir, { recursive: true })
  let count = 0
  for (const num of PRODUCT_NUMS) {
    const pad = String(num).padStart(2, '0')
    for (const still of STILLS) {
      const name = `detail_${pad}_${still}_big.webp`
      fs.writeFileSync(path.join(outDir, name), bytes)
      count += 1
    }
  }
  console.log(`Wrote ${count} placeholder(s) → ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
