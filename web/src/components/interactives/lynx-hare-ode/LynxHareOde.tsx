import { useMemo, useState } from 'react'
import { DEFAULTS, INIT, LYNX_HARE, ensemble, equilibrium, integrate } from './engine'
import type { LvParams } from './engine'

const T_MAX = 20
const TS_W = 360
const PP_W = 300
const HGT = 300
const PAD = 34
const POP_MAX = 90
const LYNX_MAX = 70

function tsX(t: number): number {
  return PAD + (t / T_MAX) * (TS_W - PAD - 8)
}
function tsY(v: number): number {
  return HGT - PAD - (v / POP_MAX) * (HGT - PAD - 10)
}
function ppX(h: number): number {
  return PAD + (h / POP_MAX) * (PP_W - PAD - 8)
}
function ppY(l: number): number {
  return HGT - PAD - (l / LYNX_MAX) * (HGT - PAD - 10)
}

function path(xs: readonly number[], ys: readonly number[], fx: (v: number) => number, fy: (v: number) => number): string {
  let d = ''
  for (let i = 0; i < xs.length; i += 2) {
    d += `${i === 0 ? 'M' : 'L'}${fx(xs[i]!).toFixed(1)},${fy(ys[i]!).toFixed(1)}`
  }
  return d
}

export function LynxHareOde() {
  const [p, setP] = useState<LvParams>(DEFAULTS)

  const main = useMemo(() => integrate(p, INIT, T_MAX, 0.02), [p])
  const orbits = useMemo(() => ensemble(p, INIT, T_MAX, 6), [p])
  const eq = equilibrium(p)

  const set = (k: keyof LvParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP((prev) => ({ ...prev, [k]: Number(e.target.value) }))

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Hares, lynx, and a model you have to solve</p>
        <p className="font-mono text-xs text-secondary">
          cycle centre ≈ ({eq[0].toFixed(0)}k hare, {eq[1].toFixed(0)}k lynx)
        </p>
      </div>

      <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_300px]">
        {/* time series with the pelt data overlaid */}
        <div className="rounded-card border border-line bg-ink-950">
          <svg viewBox={`0 0 ${TS_W} ${HGT}`} className="w-full" role="img" aria-label="Hare and lynx populations over time, with the Hudson's Bay pelt record overlaid">
            {[0, 30, 60, 90].map((g) => (
              <g key={g}>
                <line x1={PAD} x2={TS_W - 8} y1={tsY(g)} y2={tsY(g)} stroke="var(--line)" strokeWidth="1" opacity="0.2" />
                <text x={PAD - 5} y={tsY(g) + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">{g}</text>
              </g>
            ))}
            <path d={path(main.t, main.H, tsX, tsY)} fill="none" stroke="var(--brass-400)" strokeWidth="1.8" />
            <path d={path(main.t, main.L, tsX, tsY)} fill="none" stroke="var(--verdigris-400)" strokeWidth="1.8" />
            {LYNX_HARE.map((d) => (
              <g key={d.year}>
                <circle cx={tsX(d.year - 1900)} cy={tsY(d.hare)} r={1.8} fill="var(--brass-200)" opacity="0.8" />
                <circle cx={tsX(d.year - 1900)} cy={tsY(d.lynx)} r={1.8} fill="none" stroke="var(--verdigris-400)" strokeWidth="1" opacity="0.8" />
              </g>
            ))}
            <text x={(PAD + TS_W) / 2} y={HGT - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">years (from 1900)</text>
            <text x={PAD + 4} y={16} fill="var(--brass-200)" fontSize="8" fontFamily="var(--font-mono)">hare</text>
            <text x={PAD + 40} y={16} fill="var(--verdigris-400)" fontSize="8" fontFamily="var(--font-mono)">lynx</text>
          </svg>
        </div>

        {/* phase portrait */}
        <div className="rounded-card border border-line bg-ink-950">
          <svg viewBox={`0 0 ${PP_W} ${HGT}`} className="w-full" role="img" aria-label="Phase portrait: lynx against hare, a closed orbit">
            {orbits.map((o, i) => (
              <path key={i} d={path(o.H, o.L, ppX, ppY)} fill="none" stroke="var(--brass-400)" strokeWidth="1" opacity="0.2" />
            ))}
            <path d={path(main.H, main.L, ppX, ppY)} fill="none" stroke="var(--stat-posterior)" strokeWidth="1.8" />
            <circle cx={ppX(eq[0])} cy={ppY(eq[1])} r={2.4} fill="var(--brass-200)" />
            <circle cx={ppX(INIT[0])} cy={ppY(INIT[1])} r={2.4} fill="none" stroke="var(--bone-300)" strokeWidth="1.2" />
            <text x={(PAD + PP_W) / 2} y={HGT - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">hare (thousands)</text>
            <text x={12} y={(PAD + HGT) / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)" transform={`rotate(-90 12 ${(PAD + HGT) / 2})`}>lynx (thousands)</text>
          </svg>
        </div>
      </div>

      <p className="mt-2 font-mono text-xs text-secondary">
        left: solved trajectories vs pelt record · right: the orbit in (hare, lynx) space, brass dot = equilibrium, faint loops = parameter spread
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">hare birth b_H: {p.bH.toFixed(2)}</span>
          <input type="range" min={0.2} max={1} step={0.01} value={p.bH} onChange={set('bH')} className="mt-1 w-full accent-(--brass-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">predation m_H: {p.mH.toFixed(3)}</span>
          <input type="range" min={0.01} max={0.05} step={0.001} value={p.mH} onChange={set('mH')} className="mt-1 w-full accent-(--brass-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">lynx birth b_L: {p.bL.toFixed(3)}</span>
          <input type="range" min={0.01} max={0.05} step={0.001} value={p.bL} onChange={set('bL')} className="mt-1 w-full accent-(--verdigris-400)" />
        </label>
        <label className="text-sm text-secondary">
          <span className="font-mono text-xs">lynx death m_L: {p.mL.toFixed(2)}</span>
          <input type="range" min={0.3} max={1.2} step={0.01} value={p.mL} onChange={set('mL')} className="mt-1 w-full accent-(--verdigris-400)" />
        </label>
      </div>

      <p className="mt-4 text-sm text-secondary">
        There is no formula for hare next year — you have to integrate the
        equations forward, which is exactly what the golem does. The four rates
        do not set the populations directly; they set the shape of the loop.
        Raise the predation rate and the cycle tightens; drop the lynx death
        rate and the predators overrun the top of the swing. The pelt record
        cycles roughly every ten years, and the model earns its keep by
        producing that rhythm from a mechanism rather than a curve fit.
      </p>
    </div>
  )
}
