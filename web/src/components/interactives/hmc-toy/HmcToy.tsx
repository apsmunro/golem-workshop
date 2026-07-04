import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RNG } from '../../../lib/rng'
import { correlatedGaussian, densityGrid, funnel, hmcStep } from './engine'
import type { TargetDist, Trajectory, Vec2 } from './engine'

const PRESETS: { id: string; label: string; make: () => TargetDist; start: Vec2 }[] = [
  { id: 'bowl', label: 'round bowl', make: () => correlatedGaussian(0), start: [0, 0] },
  { id: 'ridge', label: 'the ridge (ρ = 0.9)', make: () => correlatedGaussian(0.9), start: [0, 0] },
  { id: 'funnel', label: "Neal's funnel", make: () => funnel(), start: [0, 0] },
]

const W = 460
const H = 400
const GRID = 116

function cssColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function HmcToy() {
  const [presetId, setPresetId] = useState('bowl')
  const [eps, setEps] = useState(0.18)
  const [L, setL] = useState(18)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({ n: 0, accepted: 0, divergences: 0 })
  const [trace, setTrace] = useState<number[]>([])

  const preset = PRESETS.find((p) => p.id === presetId)!
  const target = useMemo(() => preset.make(), [preset])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLCanvasElement | null>(null)
  const dotsRef = useRef<HTMLCanvasElement | null>(null)
  const rngRef = useRef(new RNG(1959, 9))
  const qRef = useRef<Vec2>(preset.start)
  const rafRef = useRef(0)
  const runningRef = useRef(false)
  runningRef.current = running

  const toPx = useCallback(
    (q: Vec2): [number, number] => [
      ((q[0] - target.xRange[0]) / (target.xRange[1] - target.xRange[0])) * W,
      H - ((q[1] - target.yRange[0]) / (target.yRange[1] - target.yRange[0])) * H,
    ],
    [target],
  )

  // rebuild background + reset the chain when the bowl changes
  useEffect(() => {
    const bg = document.createElement('canvas')
    bg.width = W
    bg.height = H
    const ctx = bg.getContext('2d')!
    ctx.fillStyle = cssColor('--ink-950') || '#0B1220'
    ctx.fillRect(0, 0, W, H)
    // density rendered to a small bitmap, scaled up smoothly — no moiré
    const grid = densityGrid(target, GRID, GRID)
    const tiny = document.createElement('canvas')
    tiny.width = GRID
    tiny.height = GRID
    const tctx = tiny.getContext('2d')!
    tctx.fillStyle = cssColor('--bone-100') || '#F3EDDF'
    tctx.fillRect(0, 0, 1, 1)
    const [br, bgc, bb] = tctx.getImageData(0, 0, 1, 1).data
    const img = tctx.createImageData(GRID, GRID)
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        // grid row j is low y; canvas y runs downward
        const k = ((GRID - 1 - j) * GRID + i) * 4
        img.data[k] = br!
        img.data[k + 1] = bgc!
        img.data[k + 2] = bb!
        img.data[k + 3] = Math.round(Math.pow(grid[j * GRID + i]!, 0.55) * 42)
      }
    }
    tctx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(tiny, 0, 0, W, H)
    bgRef.current = bg

    const dots = document.createElement('canvas')
    dots.width = W
    dots.height = H
    dotsRef.current = dots

    qRef.current = preset.start
    rngRef.current = new RNG(1959, 9)
    setStats({ n: 0, accepted: 0, divergences: 0 })
    setTrace([])
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
    const main = canvasRef.current?.getContext('2d')
    if (main) {
      main.clearRect(0, 0, W, H)
      main.drawImage(bg, 0, 0)
    }
  }, [target, preset])

  const compose = useCallback(
    (extra?: (ctx: CanvasRenderingContext2D) => void) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || !bgRef.current || !dotsRef.current) return
      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(bgRef.current, 0, 0)
      ctx.drawImage(dotsRef.current, 0, 0)
      if (extra) extra(ctx)
    },
    [],
  )

  const settle = useCallback(
    (traj: Trajectory) => {
      qRef.current = traj.q1
      if (traj.accepted && dotsRef.current) {
        const dctx = dotsRef.current.getContext('2d')!
        const [x, y] = toPx(traj.q1)
        dctx.fillStyle = cssColor('--brass-400') || '#C9A227'
        dctx.globalAlpha = 0.65
        dctx.beginPath()
        dctx.arc(x, y, 1.7, 0, 2 * Math.PI)
        dctx.fill()
      }
      setStats((s) => ({
        n: s.n + 1,
        accepted: s.accepted + (traj.accepted ? 1 : 0),
        divergences: s.divergences + (traj.divergent ? 1 : 0),
      }))
      setTrace((t) => [...t.slice(-159), traj.q1[0]])
    },
    [toPx],
  )

  const drawTrajectory = useCallback(
    (ctx: CanvasRenderingContext2D, traj: Trajectory, upTo: number) => {
      ctx.strokeStyle = traj.divergent
        ? cssColor('--clay-500') || '#B4552D'
        : cssColor('--bone-300') || '#D8CFB8'
      ctx.lineWidth = traj.divergent ? 1.6 : 1
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      const pts = traj.points.slice(0, upTo + 1)
      pts.forEach((p, i) => {
        const [x, y] = toPx(p.q)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      const last = pts[pts.length - 1]!
      const [mx, my] = toPx(last.q)
      ctx.fillStyle = cssColor('--brass-200') || '#E8CE7A'
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(mx, my, 3.4, 0, 2 * Math.PI)
      ctx.fill()
    },
    [toPx],
  )

  const flick = useCallback(
    (thenContinue: boolean) => {
      const traj = hmcStep(target, qRef.current, eps, L, rngRef.current)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        compose((ctx) => drawTrajectory(ctx, traj, traj.points.length - 1))
        settle(traj)
        if (thenContinue && runningRef.current) {
          rafRef.current = requestAnimationFrame(() => flick(true))
        }
        return
      }
      let step = 0
      const perFrame = Math.max(1, Math.ceil(traj.points.length / 26))
      const tick = () => {
        step = Math.min(step + perFrame, traj.points.length - 1)
        compose((ctx) => drawTrajectory(ctx, traj, step))
        if (step < traj.points.length - 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          settle(traj)
          rafRef.current = requestAnimationFrame(() => {
            compose(
              traj.divergent
                ? (ctx) => drawTrajectory(ctx, traj, traj.points.length - 1)
                : undefined,
            )
            if (thenContinue && runningRef.current) {
              window.setTimeout(() => {
                if (runningRef.current) flick(true)
              }, 90)
            }
          })
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [target, eps, L, compose, drawTrajectory, settle],
  )

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  useEffect(() => {
    if (running) flick(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const acceptRate = stats.n === 0 ? null : stats.accepted / stats.n

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresetId(p.id)}
              aria-pressed={presetId === p.id}
              className={`cursor-pointer rounded-card border px-3 py-1.5 font-mono text-xs transition-colors duration-[180ms] ${
                presetId === p.id
                  ? 'border-accent text-accent-bright'
                  : 'border-line text-secondary hover:border-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-card border border-line">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full"
            role="img"
            aria-label={`${target.name}: posterior surface with HMC samples`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (!running) flick(false)
            }}
            disabled={running}
            className="cursor-pointer rounded-card border border-accent px-4 py-1.5 text-sm text-accent-bright transition-colors duration-[180ms] enabled:hover:bg-surface disabled:cursor-not-allowed disabled:border-line disabled:text-secondary"
          >
            Flick the marble
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="cursor-pointer rounded-card border border-line px-4 py-1.5 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent"
          >
            {running ? 'Pause' : 'Run'}
          </button>
        </div>
      </div>

      <div>
        <label className="block">
          <span className="font-mono text-xs text-secondary">
            step size ε: {eps.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.02}
            max={2.6}
            step={0.02}
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="mt-4 block">
          <span className="font-mono text-xs text-secondary">leapfrog steps L: {L}</span>
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={L}
            onChange={(e) => setL(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>

        <dl className="mt-6 space-y-2 font-mono text-xs">
          <div className="flex justify-between border-b border-line pb-2">
            <dt className="text-secondary">samples</dt>
            <dd>{stats.n}</dd>
          </div>
          <div className="flex justify-between border-b border-line pb-2">
            <dt className="text-secondary">acceptance</dt>
            <dd>{acceptRate === null ? '—' : `${(acceptRate * 100).toFixed(0)}%`}</dd>
          </div>
          <div className="flex justify-between border-b border-line pb-2">
            <dt className="text-secondary">divergences</dt>
            <dd className={stats.divergences > 0 ? 'text-(--clay-500)' : ''}>
              {stats.divergences}
            </dd>
          </div>
        </dl>

        <p className="eyebrow mt-6">trace of q₁</p>
        <svg viewBox="0 0 240 90" className="mt-2 w-full rounded-card border border-line bg-ink-950" aria-hidden="true">
          {trace.length > 1
            ? (() => {
                const lo = target.xRange[0]
                const hi = target.xRange[1]
                const pts = trace
                  .map((v, i) => {
                    const x = (i / Math.max(trace.length - 1, 1)) * 232 + 4
                    const y = 86 - ((v - lo) / (hi - lo)) * 82
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
                  })
                  .join(' ')
                return <path d={pts} fill="none" stroke="var(--stat-posterior)" strokeWidth="1" />
              })()
            : null}
        </svg>
      </div>
    </div>
  )
}
