/**
 * WebRRunner — an editable R cell running on webR (WASM R in the browser).
 * The engine loads once per page visit, on demand, shared by all cells.
 * Text output only in v1; plots come with the Posterior Explorer work.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { getWebR, outputMatches } from './webr-session'
import type { RunResult } from './webr-session'

type EngineStatus = 'cold' | 'waking' | 'ready' | 'failed'

/** Module-level so multiple cells share one status once R wakes. */
let engineStatus: EngineStatus = 'cold'
const statusListeners = new Set<(s: EngineStatus) => void>()

function setEngineStatus(s: EngineStatus) {
  engineStatus = s
  statusListeners.forEach((fn) => fn(s))
}

interface WebRRunnerProps {
  /** initial R code; the learner can edit freely */
  code: string
  /** fragments that must appear in the output for the brass check */
  expect?: string[]
  /** short label above the cell */
  caption?: string
  /** rows for the editor */
  rows?: number
}

export function WebRRunner({ code, expect, caption, rows = 8 }: WebRRunnerProps) {
  const [source, setSource] = useState(code)
  const [status, setStatus] = useState<EngineStatus>(engineStatus)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  // Tab is trapped for indentation while editing; Escape releases it so
  // keyboard users can still leave the cell (WCAG 2.1.2).
  const tabFreeRef = useRef(false)
  const keysHintId = useId()

  useEffect(() => {
    statusListeners.add(setStatus)
    setStatus(engineStatus)
    return () => {
      statusListeners.delete(setStatus)
    }
  }, [])

  const wake = async () => {
    if (engineStatus === 'cold' || engineStatus === 'failed') {
      setEngineStatus('waking')
      try {
        await getWebR()
        setEngineStatus('ready')
      } catch {
        setEngineStatus('failed')
      }
    }
  }

  const run = async () => {
    await wake()
    if (engineStatus === 'failed') return
    setRunning(true)
    try {
      const session = await getWebR()
      setResult(await session.runR(source))
    } finally {
      setRunning(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      tabFreeRef.current = true
      return
    }
    if (e.key === 'Tab' && !e.shiftKey && !tabFreeRef.current) {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart, selectionEnd } = el
      setSource(source.slice(0, selectionStart) + '  ' + source.slice(selectionEnd))
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 2
      })
    }
  }

  // The brass check marks the cell's own snippet. Once the learner edits,
  // the expected fragments no longer apply — say so instead of letting the
  // check vanish as if something broke.
  const edited = source !== code
  const passed =
    !edited &&
    result !== null &&
    result.error === null &&
    expect !== undefined &&
    outputMatches(result.lines, expect)

  return (
    <figure className="rounded-card border border-line">
      {caption ? (
        <figcaption className="border-b border-line px-4 py-2">
          <span className="eyebrow">{caption}</span>
        </figcaption>
      ) : null}
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          tabFreeRef.current = false
        }}
        rows={rows}
        spellCheck={false}
        aria-label={caption ?? 'R code cell'}
        aria-describedby={keysHintId}
        className="block w-full resize-y bg-ink-950 p-4 font-mono text-sm leading-relaxed text-bone-100 outline-none"
      />
      <span id={keysHintId} className="sr-only">
        Tab indents inside the cell. Press Escape, then Tab, to move focus out.
      </span>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={run}
          disabled={running || status === 'waking'}
          className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950 disabled:cursor-wait disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run'}
        </button>
        <button
          type="button"
          onClick={() => {
            setSource(code)
            setResult(null)
          }}
          className="cursor-pointer rounded-card border border-line px-4 py-1.5 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent"
        >
          Reset
        </button>
        {status === 'cold' ? (
          <span className="text-sm text-secondary">
            First run wakes the R engine (~15 MB, once per visit).
          </span>
        ) : status === 'waking' ? (
          <span className="flex items-center gap-2 text-sm text-secondary">
            <span className="inline-block h-2 w-2 animate-pulse rounded-control bg-clay-500" />
            The R golem is waking. Clay takes a moment to stir.
          </span>
        ) : status === 'failed' ? (
          <span className="text-sm text-stat-danger">
            The engine failed to load — check your connection and run again.
          </span>
        ) : passed ? (
          <span className="flex items-center gap-2 font-mono text-sm text-accent-bright">
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" fill="var(--brass-400)" />
            </svg>
            output matches
          </span>
        ) : expect && edited && result && !result.error ? (
          <span className="text-sm text-secondary">
            Your experiment now — the check marks only the original snippet.
            Reset restores it.
          </span>
        ) : null}
      </div>
      {result ? (
        <pre className="overflow-x-auto border-t border-line bg-ink-950 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-bone-100">
          {result.error ? (
            <span className="text-stat-danger">{result.error}</span>
          ) : result.lines.length === 0 ? (
            <span className="text-bone-300">(no printed output)</span>
          ) : (
            result.lines.map((l, i) => (
              <span key={i} className={l.type === 'stderr' ? 'text-stat-danger' : undefined}>
                {l.text}
                {'\n'}
              </span>
            ))
          )}
        </pre>
      ) : null}
    </figure>
  )
}
