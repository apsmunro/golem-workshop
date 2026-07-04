import { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkshopStore } from '../../../store'
import type { Density } from '../../../lib/stats'
import { scoreSketch, sketchIsScorable, sketchToDensity } from './engine'
import type { SketchPoint } from './engine'

interface CalibrationSketchProps {
  /** unique prompt id, e.g. "ch02-globe-posterior" */
  id: string
  chapter: number
  /** the true density, revealed after the guess */
  truth: Density
  /** axis labels, e.g. ["0", "proportion water p", "1"] */
  axis: { left: string; label: string; right: string }
  onScored?: (score: number) => void
}

const HEIGHT = 220

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function CalibrationSketch({ id, chapter, truth, axis, onScored }: CalibrationSketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<SketchPoint[]>([])
  const drawingRef = useRef(false)
  const [hasInk, setHasInk] = useState(false)
  const [revealed, setRevealed] = useState<number | null>(null)
  const recordCalibration = useWorkshopStore((s) => s.recordCalibration)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // baseline hairline
    ctx.strokeStyle = cssVar('--line')
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h - 1)
    ctx.lineTo(w, h - 1)
    ctx.stroke()

    // the learner's stroke, in bone
    const pts = pointsRef.current
    if (pts.length > 1) {
      ctx.strokeStyle = cssVar('--stat-data')
      ctx.lineWidth = 1.5
      ctx.beginPath()
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, Math.min(p.y, h - 1))
        else ctx.lineTo(p.x, Math.min(p.y, h - 1))
      })
      ctx.stroke()
    }

    // the truth, revealed in brass with the house fill
    if (revealed !== null) {
      const maxY = Math.max(...truth.y)
      const color = cssVar('--stat-posterior')
      ctx.beginPath()
      truth.y.forEach((v, i) => {
        const px = (i / (truth.y.length - 1)) * w
        const py = h - 1 - (v / maxY) * (h - 16)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineTo(w, h - 1)
      ctx.lineTo(0, h - 1)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.globalAlpha = 0.08
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [revealed, truth])

  useEffect(() => {
    redraw()
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(redraw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [redraw])

  const pointerPos = (e: React.PointerEvent): SketchPoint => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (revealed !== null) return
    drawingRef.current = true
    canvasRef.current?.setPointerCapture(e.pointerId)
    pointsRef.current.push(pointerPos(e))
    setHasInk(true)
    redraw()
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || revealed !== null) return
    pointsRef.current.push(pointerPos(e))
    redraw()
  }
  const onPointerUp = () => {
    drawingRef.current = false
  }

  const clear = () => {
    pointsRef.current = []
    setHasInk(false)
    redraw()
  }

  const reveal = () => {
    const canvas = canvasRef.current
    if (!canvas || revealed !== null) return
    const density = sketchToDensity(
      pointsRef.current,
      canvas.clientWidth,
      canvas.clientHeight,
      truth.y.length,
    )
    if (!sketchIsScorable(density)) return
    const score = scoreSketch(density, truth.y)
    setRevealed(score)
    recordCalibration({ id, chapter, score })
    onScored?.(score)
  }

  const scorable = hasInk

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ height: HEIGHT }}
        className="w-full cursor-crosshair touch-none rounded-card border border-line bg-ink-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="img"
        aria-label={`Sketch your guess for: ${axis.label}`}
      />
      <div className="mt-1 flex justify-between font-mono text-xs text-secondary">
        <span>{axis.left}</span>
        <span>{axis.label}</span>
        <span>{axis.right}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reveal}
          disabled={!scorable || revealed !== null}
          className="cursor-pointer rounded-card border border-accent px-4 py-2 text-sm text-accent-bright transition-colors duration-[180ms] hover:bg-accent hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reveal the posterior
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk || revealed !== null}
          className="cursor-pointer rounded-card border border-line px-4 py-2 text-sm text-secondary transition-colors duration-[180ms] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
        {revealed !== null ? (
          <span className="font-mono text-sm">
            overlap{' '}
            <span className="text-accent-bright">{(revealed * 100).toFixed(1)}%</span>
          </span>
        ) : !scorable ? (
          <span className="text-sm text-secondary">
            Draw the shape you expect, then reveal.
          </span>
        ) : null}
      </div>
    </div>
  )
}
