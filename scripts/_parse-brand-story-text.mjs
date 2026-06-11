import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const json = JSON.parse(fs.readFileSync(path.join(__dirname, '_figma-node-output.json'), 'utf8'))
const root = json.nodes['2898:5238'].document

const texts = []
function walk(n) {
  if (n.type === 'TEXT' && n.characters) {
    texts.push({
      name: n.name,
      text: n.characters,
      fontSize: n.style?.fontSize,
      fontWeight: n.style?.fontWeight,
      align: n.style?.textAlignHorizontal,
    })
  }
  for (const c of n.children || []) walk(c)
}
walk(root)
fs.writeFileSync(path.join(__dirname, '_brand-story-texts.json'), JSON.stringify(texts, null, 2))
console.log('count', texts.length)
