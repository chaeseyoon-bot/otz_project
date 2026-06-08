/**
 * Minimal RFC 4180 CSV parser.
 *
 * Handles quoted fields, escaped quotes (`""`), embedded commas/newlines, and
 * both `\n` and `\r\n` line endings. Returns an array of rows, each a string[].
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char === '\r') {
      // Swallow; the following \n (if any) finalizes the row.
    } else {
      field += char
    }
  }

  // Flush the trailing field/row when the file doesn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

/** Parses CSV text into objects keyed by the header row. */
export function parseCsvToObjects(text: string): Array<Record<string, string>> {
  const rows = parseCsv(text).filter((r) => r.some((cell) => cell.trim() !== ''))
  if (rows.length === 0) return []

  const [header, ...body] = rows
  return body.map((cells) => {
    const obj: Record<string, string> = {}
    header.forEach((key, index) => {
      obj[key.trim()] = (cells[index] ?? '').trim()
    })
    return obj
  })
}
