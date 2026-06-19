import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ClassicLevel } from 'classic-level'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BROWSER_DIRS = {
  edge: path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft/Edge/User Data/Default/Local Storage/leveldb'),
  chrome: path.join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/User Data/Default/Local Storage/leveldb'),
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (name === 'LOCK') continue
    fs.copyFileSync(path.join(src, name), path.join(dest, name))
  }
}

async function readFromDir(dbDir) {
  const db = new ClassicLevel(dbDir, { keyEncoding: 'buffer', valueEncoding: 'buffer' })
  const candidates = []

  for await (const [key, value] of db.iterator()) {
    const keyText = key.toString('utf8')
    if (!keyText.includes('otz-admin-editorial')) continue

    let text = ''
    if (value[0] === 0) {
      text = value.subarray(1).toString('utf16le').replace(/\0+$/g, '')
    } else if (value[0] === 1) {
      text = value.subarray(1).toString('utf8').replace(/\0+$/g, '')
    } else {
      text = value.toString('utf8').replace(/\0+$/g, '')
    }

    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed.events) || parsed.events.length === 0) continue

      const updatedMs = Date.parse(parsed.updatedAt ?? '')
      candidates.push({
        key: keyText,
        parsed,
        valueBytes: value.length,
        updatedMs: Number.isFinite(updatedMs) ? updatedMs : 0,
        eventCount: parsed.events.length,
      })
    } catch (e) {
      console.error('parse failed for', keyText, e.message)
    }
  }

  await db.close()
  return candidates
}

async function extractFromBrowser(browserName, sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`[${browserName}] leveldb not found:`, sourceDir)
    return []
  }

  const tempDir = path.join(__dirname, `_leveldb-copy-${browserName}`)
  fs.rmSync(tempDir, { recursive: true, force: true })
  copyDir(sourceDir, tempDir)

  const candidates = await readFromDir(tempDir)
  fs.rmSync(tempDir, { recursive: true, force: true })

  return candidates.map((item) => ({ ...item, browser: browserName }))
}

const browserArg = process.argv[2]?.toLowerCase()
const browsersToScan =
  browserArg && BROWSER_DIRS[browserArg]
    ? [browserArg]
    : browserArg === 'all'
      ? Object.keys(BROWSER_DIRS)
      : ['chrome', 'edge']

let allCandidates = []
for (const name of browsersToScan) {
  const found = await extractFromBrowser(name, BROWSER_DIRS[name])
  allCandidates = allCandidates.concat(found)
}

if (!allCandidates.length) {
  console.error('No editorial config found in browser localStorage.')
  process.exit(1)
}

allCandidates.sort((a, b) => {
  if (b.updatedMs !== a.updatedMs) return b.updatedMs - a.updatedMs
  if (b.eventCount !== a.eventCount) return b.eventCount - a.eventCount
  return b.valueBytes - a.valueBytes
})

const best = allCandidates[0]
console.log(`Using ${best.browser} (${best.key})`)
console.log('value bytes:', best.valueBytes)
console.log('updatedAt:', best.parsed.updatedAt ?? 'n/a')

const outPath = path.join(__dirname, '_edge-editorial-export.json')
fs.writeFileSync(outPath, JSON.stringify(best.parsed, null, 2))
console.log(`Exported ${best.parsed.events.length} events -> ${outPath}`)
for (const event of best.parsed.events) {
  console.log('-', event.id, (event.title ?? '').slice(0, 60))
}

if (allCandidates.length > 1) {
  console.log('\nOther candidates:')
  for (const item of allCandidates.slice(1)) {
    console.log(
      `- ${item.browser} | events=${item.eventCount} | updatedAt=${item.parsed.updatedAt ?? 'n/a'} | ${item.key}`,
    )
  }
}
