import { useMemo, useState } from 'react'
import {
  POPULATION,
  SOCIETIES,
  correlationMatrix,
  kernel,
  mdsLayout,
} from './engine'

const MAP_W = 380
const MAP_H = 340
const CURVE_W = 320
const CURVE_H = 340
const PAD = 30

export function GpIslands() {
  const [etasq, setEtasq] = useState(0.2)
  const [rhosq, setRhosq] = useState(1.5)

  const layout = useMemo(() => mdsLayout(), [])
  const corr = useMemo(() => correlationMatrix(etasq, rhosq), [etasq, rhosq])
  const k = useMemo(() => kernel(etasq, rhosq), [etasq, rhosq])

  // scale MDS coordinates into the map viewport
  const { pts } = useMemo(() => {
    const xs = layout.map((p) => p.x)
    const ys = layout.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const sx = (MAP_W - 2 * PAD) / (maxX - minX)
    const sy = (MAP_H - 2 * PAD) / (maxY - minY)
    const s = Math.min(sx, sy)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const pts = layout.map((p) => ({
      x: MAP_W / 2 + (p.x - cx) * s,
      y: MAP_H / 2 + (p.y - cy) * s,
    }))
    return { pts }
  }, [layout])

  const logPop = POPULATION.map((p) => Math.log(p))
  const minLP = Math.min(...logPop)
  const maxLP = Math.max(...logPop)
  const rOf = (i: number) => 4 + ((logPop[i]! - minLP) / (maxLP - minLP)) * 8

  const kmax = etasq + 0.01
  const curveX = (d: number) => PAD + (d / 8) * (CURVE_W - PAD - 10)
  const curveY = (val: number) => CURVE_H - PAD - (val / kmax) * (CURVE_H - PAD - 14)

  const curve: string = (() => {
    const pts2: string[] = []
    for (let i = 0; i <= 80; i++) {
      const d = (i / 80) * 8
      pts2.push(`${i === 0 ? 'M' : 'L'}${curveX(d).toFixed(1)},${curveY(k(d)).toFixed(1)}`)
    }
    return pts2.join(' ')
  })()

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Distance decides who pools with whom</p>
        <p className="font-mono text-xs text-secondary">
          η² = {etasq.toFixed(2)} · ρ² = {rhosq.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_320px]">
        {/* the islands, laid out by MDS, connected by learned correlation */}
        <div className="rounded-card border border-line bg-ink-950">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full" role="img" aria-label="Ten Pacific societies; line opacity is the Gaussian-process correlation between them">
            {pts.map((a, i) =>
              pts.map((b, j) =>
                j > i && corr[i]![j]! > 0.02 ? (
                  <line
                    key={`${i}-${j}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="var(--brass-400)"
                    strokeWidth="1.4"
                    opacity={Math.min(0.9, corr[i]![j]! * 0.9)}
                  />
                ) : null,
              ),
            )}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={rOf(i)} fill="var(--ink-800)" stroke="var(--bone-300)" strokeWidth="1.2" />
                <text x={p.x} y={p.y - rOf(i) - 3} textAnchor="middle" fill="var(--bone-300)" fontSize="8" fontFamily="var(--font-mono)">
                  {SOCIETIES[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* the kernel: covariance as a function of distance */}
        <div className="rounded-card border border-line bg-ink-950">
          <svg viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} className="w-full" role="img" aria-label="Covariance as a function of distance">
            <line x1={PAD} y1={curveY(0)} x2={CURVE_W - 10} y2={curveY(0)} stroke="var(--line)" strokeWidth="1" />
            <line x1={PAD} y1={curveY(0)} x2={PAD} y2={14} stroke="var(--line)" strokeWidth="1" />
            <path d={curve} fill="none" stroke="var(--brass-400)" strokeWidth="1.6" />
            <path d={`${curve} L${curveX(8)},${curveY(0)} L${curveX(0)},${curveY(0)} Z`} fill="var(--brass-400)" opacity="0.08" />
            {[0, 2, 4, 6, 8].map((d) => (
              <text key={d} x={curveX(d)} y={CURVE_H - PAD + 14} textAnchor="middle" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">
                {d}
              </text>
            ))}
            <text x={(CURVE_W + PAD) / 2} y={CURVE_H - 6} textAnchor="middle" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">
              distance (thousands of km)
            </text>
            <text x={PAD - 6} y={20} textAnchor="end" fill="var(--bone-300)" fontSize="9" fontFamily="var(--font-mono)">
              cov
            </text>
          </svg>
        </div>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        map: circle size = log population · brass line opacity = learned correlation · curve: K(d) = η²·exp(−ρ²·d²)
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">max covariance η²: {etasq.toFixed(2)}</span>
          <input type="range" min={0.02} max={1} step={0.01} value={etasq} onChange={(e) => setEtasq(Number(e.target.value))} className="mt-1 w-full accent-(--brass-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">decay rate ρ²: {rhosq.toFixed(2)}</span>
          <input type="range" min={0.05} max={3} step={0.05} value={rhosq} onChange={(e) => setRhosq(Number(e.target.value))} className="mt-1 w-full accent-(--brass-400)" />
        </label>
      </div>

      <p className="mt-4 text-sm text-secondary">
        One curve governs every pair. Raise ρ² and it drops off a cliff — only
        the tightest neighbors, Malekula, Tikopia, and Santa Cruz, stay linked,
        and the rest of the map goes dark. Lower it and covariance reaches across
        open ocean, tying Hawaii faintly to everyone. The Gaussian process never
        estimates a separate effect per society; it estimates the shape of this
        decline and lets geography do the pooling. That is how ten societies with
        one tool count each still manage to inform one another.
      </p>
    </div>
  )
}
