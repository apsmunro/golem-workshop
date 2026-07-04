/**
 * prose-lint — scans learner-facing text for AI-tell vocabulary and phrases
 * (CLAUDE.md §4.1). Patterns live in scripts/banned-words.txt at repo root:
 * one case-insensitive regex per line, `#` comments allowed.
 *
 * Scope: content/, UI pages/components, and course data (problems, hints).
 * A line containing `prose-lint-disable` is skipped — add a one-line
 * justification next to it.
 *
 * Exit 1 on any hit, so CI can gate on it.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const webRoot = resolve(import.meta.dirname, '..')
const repoRoot = resolve(webRoot, '..')

const patternFile = join(repoRoot, 'scripts', 'banned-words.txt')
const patterns: { source: string; re: RegExp }[] = readFileSync(patternFile, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'))
  .map((source) => ({ source, re: new RegExp(`\\b(?:${source})\\b`, 'i') }))

const SCAN_ROOTS = [
  join(webRoot, 'src', 'content'),
  join(webRoot, 'src', 'pages'),
  join(webRoot, 'src', 'components'),
  join(webRoot, 'public', 'data', 'course'),
]
const SCAN_EXT = /\.(mdx?|tsx?|ya?ml|json|txt)$/

function* walk(dir: string): Generator<string> {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return // scan root may not exist yet
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (SCAN_EXT.test(entry)) yield full
  }
}

let hits = 0
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (line.includes('prose-lint-disable')) return
      for (const { source, re } of patterns) {
        if (re.test(line)) {
          hits++
          console.log(`${relative(repoRoot, file)}:${i + 1}: "${source}" — ${line.trim().slice(0, 100)}`)
        }
      }
    })
  }
}

if (hits > 0) {
  console.error(`\nprose-lint: ${hits} hit(s). Rewrite them (CLAUDE.md §4.1) or add prose-lint-disable with a justification.`)
  process.exit(1)
}
console.log('prose-lint: clean.')
