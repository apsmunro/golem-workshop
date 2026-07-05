/**
 * Post-build: preload the two above-the-fold fonts (body STIX, display
 * Gloock) from dist/index.html so their fetch starts at HTML parse instead
 * of after the CSS applies. Saves ~0.5s simulated-mobile FCP. Runs as part
 * of `npm run build`; hashed names are read from the emitted bundle.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')
const assets = readdirSync(join(dist, 'assets'))
const wanted = [/^stix-two-text-latin-400-normal-.*\.woff2$/, /^gloock-latin-400-normal-.*\.woff2$/]

const htmlPath = join(dist, 'index.html')
let html = readFileSync(htmlPath, 'utf8')
// Asset URLs in the built HTML carry the deploy base path; reuse it.
const base = html.match(/(?:src|href)="([^"]*)assets\//)?.[1] ?? '/'

const links = wanted
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean)
  .map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${base}assets/${f}">`)
  .join('')

if (!links) {
  console.error('inject-font-preload: no font assets found — did the build change?')
  process.exit(1)
}
html = html.replace('</title>', `</title>${links}`)
writeFileSync(htmlPath, html)
console.log(`inject-font-preload: ${links.split('rel=').length - 1} preload(s) injected.`)
