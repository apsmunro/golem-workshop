/**
 * LivingPosterior — the signature chapter-header ornament (CLAUDE.md §2.3).
 * Thin brass density curves drawn from the chapter's real draws, rising
 * and re-sampling like smoke. Canvas, pauses off-screen, one static frame
 * under prefers-reduced-motion.
 */
import { useEffect, useRef } from 'react'
import { HOUSE_SEED, RNG } from '../../lib/rng'
import {
  DEFAULTS,
  curveAlpha,
  curveRise,
  initCurves,
  tickCurves,
} from './living-posterior-engine'
import type { EngineOptions, SmokeCurve } from './living-posterior-engine'

interface LivingPosteriorProps {
  draws: readonly number[]
  /** value range the curves span; defaults to the data range. */
  range?: [number, number]
  seed?: number
}

function strokeStyle(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--stat-posterior')
    .trim()
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  curves: readonly SmokeCurve[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height)
  const color = strokeStyle()
  // The band: curves are born hugging the bottom and rise ~35% as they fade.
  const baseline = height * 0.96
  const bandHeight = height * 0.52
  const rise = height * 0.3
  for (const curve of curves) {
    const alpha = curveAlpha(curve.age)
    if (alpha <= 0.004) continue
    const offsetY = curveRise(curve.age) * rise
    ctx.beginPath()
    for (let i = 0; i < curve.xs.length; i++) {
      const px = curve.xs[i]! * width
      const py = baseline - offsetY - curve.ys[i]! * curve.scale * bandHeight
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function LivingPosterior({ draws, range, seed = HOUSE_SEED }: LivingPosteriorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || draws.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lo = range?.[0] ?? Math.min(...draws)
    const hi = range?.[1] ?? Math.max(...draws)
    const opts: EngineOptions = { ...DEFAULTS, range: [lo, hi] }
    const rng = new RNG(seed, 7)
    const curves = initCurves(draws, rng, opts)

    let width = 0
    let height = 0
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = window.devicePixelRatio || 1
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      drawFrame(ctx, curves, width, height)
    })
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      // One composed still: mid-life curves, no animation.
      tickCurves(curves, opts.lifetime * 0.25, draws, rng, opts)
      drawFrame(ctx, curves, width, height)
      return () => ro.disconnect()
    }

    let raf = 0
    let last = performance.now()
    let visible = true
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      tickCurves(curves, dt, draws, rng, opts)
      drawFrame(ctx, curves, width, height)
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([entry]) => {
      const nowVisible = entry?.isIntersecting ?? true
      if (nowVisible && !visible) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      } else if (!nowVisible && visible) {
        cancelAnimationFrame(raf)
      }
      visible = nowVisible
    })
    io.observe(canvas)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [draws, range, seed])

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
}
