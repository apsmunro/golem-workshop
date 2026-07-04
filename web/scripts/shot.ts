/**
 * Screenshot a route at both design-gate viewports (CLAUDE.md §2.5).
 *
 *   npm run shot -- /dev/specimen
 *   npm run shot -- /            # home
 *
 * Writes shots/<route>-desktop.png (1440×900) and shots/<route>-mobile.png
 * (390×844). Starts its own Vite dev server, so nothing else needs to run.
 */
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const route = process.argv[2] ?? '/'
const outDir = resolve(import.meta.dirname, '..', 'shots')
mkdirSync(outDir, { recursive: true })

const server = await createServer({
  root: resolve(import.meta.dirname, '..'),
  server: { port: 0 },
  logLevel: 'silent',
})
await server.listen()
const address = server.httpServer?.address()
if (address === null || address === undefined || typeof address === 'string') {
  throw new Error('vite dev server did not report a port')
}
const url = `http://localhost:${address.port}${route}`

const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')
const browser = await chromium.launch()
try {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ] as const) {
    const page = await browser.newPage({ viewport })
    await page.goto(url, { waitUntil: 'networkidle' })
    // Give web fonts a beat to swap in.
    await page.evaluate(() => document.fonts.ready)
    const path = resolve(outDir, `${slug}-${name}.png`)
    await page.screenshot({ path, fullPage: true })
    console.log(path)
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}
