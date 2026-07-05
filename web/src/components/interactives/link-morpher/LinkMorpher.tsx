import { useState } from 'react'
import {
  defaultConfig,
  gridlineFractions,
  invLink,
  morphFraction,
  outcomeSlope,
} from './engine'
import type { Link } from './engine'

const W = 620
const H = 300
const PAD_L = 56
const PAD_R = 56
const PAD_T = 16
const PAD_B = 30

export function LinkMorpher() {
  const [link, setLink] = useState<Link>('logit')
  const [alpha, setAlpha] = useState(0)
  const [beta, setBeta] = useState(1.2)
  const [t, setT] = useState(0)
  const [probeX, setProbeX] = useState(1.5)

  const cfg = defaultConfig(link, alpha, beta)
  const xToPx = (x: number) =>
    PAD_L + ((x - cfg.xLo) / (cfg.xHi - cfg.xLo)) * (W - PAD_L - PAD_R)
  const fToPy = (f: number) => PAD_T + (1 - f) * (H - PAD_T - PAD_B)

  const N = 120
  const curve = Array.from({ length: N + 1 }, (_, i) => {
    const x = cfg.xLo + (i / N) * (cfg.xHi - cfg.xLo)
    return `${i === 0 ? 'M' : 'L'}${xToPx(x).toFixed(1)},${fToPy(morphFraction(cfg, x, t)).toFixed(1)}`
  }).join(' ')

  const grid = gridlineFractions(cfg, t)
  const gridEtas = grid.map(
    (_, i) => cfg.etaLo + ((i + 0.5) / grid.length) * (cfg.etaHi - cfg.etaLo),
  )

  const probeEta = alpha + beta * probeX
  const probeMu = invLink(link, probeEta)
  const probeSlope = outcomeSlope(link, probeEta, beta)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">One line, two worlds</p>
        <div className="flex gap-2">
          {(['logit', 'log'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLink(l)}
              className={`cursor-pointer rounded-card border px-3 py-1 font-mono text-xs transition-colors duration-[180ms] ${
                link === l
                  ? 'border-accent text-accent-bright'
                  : 'border-line text-secondary hover:border-accent'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-card border border-line bg-ink-950">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="A linear predictor morphing through the inverse link into the outcome scale"
        >
          {/* equal-η gridlines that travel with the morph */}
          {grid.map((f, i) => (
            <g key={i}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={fToPy(f)}
                y2={fToPy(f)}
                stroke="var(--line)"
                strokeWidth="1"
                opacity="0.7"
              />
              <text
                x={PAD_L - 8}
                y={fToPy(f) + 3}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                opacity={1 - t * 0.65}
              >
                {gridEtas[i]!.toFixed(1)}
              </text>
              <text
                x={W - PAD_R + 8}
                y={fToPy(f) + 3}
                textAnchor="start"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                opacity={0.35 + t * 0.65}
              >
                {link === 'logit'
                  ? invLink(link, gridEtas[i]!).toFixed(2)
                  : invLink(link, gridEtas[i]!) < 100
                    ? invLink(link, gridEtas[i]!).toFixed(1)
                    : invLink(link, gridEtas[i]!).toExponential(0)}
              </text>
            </g>
          ))}

          {/* the model's mean function */}
          <path d={curve} fill="none" stroke="var(--stat-posterior)" strokeWidth="1.5" />

          {/* probe */}
          <line
            x1={xToPx(probeX)}
            x2={xToPx(probeX)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="var(--bone-300)"
            strokeWidth="0.7"
            opacity="0.5"
          />
          <circle
            cx={xToPx(probeX)}
            cy={fToPy(morphFraction(cfg, probeX, t))}
            r="4"
            fill="var(--stat-posterior)"
          />

          {/* x axis */}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={H - PAD_B}
            y2={H - PAD_B}
            stroke="var(--line)"
            strokeWidth="1"
          />
          <text
            x={(PAD_L + W - PAD_R) / 2}
            y={H - 8}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            predictor x
          </text>
          <text
            x={PAD_L - 8}
            y={PAD_T - 4}
            textAnchor="end"
            fill="var(--text-secondary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
            opacity={1 - t * 0.65}
          >
            η
          </text>
          <text
            x={W - PAD_R + 8}
            y={PAD_T - 4}
            textAnchor="start"
            fill="var(--text-secondary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
            opacity={0.35 + t * 0.65}
          >
            {link === 'logit' ? 'p' : 'λ'}
          </text>
        </svg>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-secondary">
          <span className="flex justify-between">
            <span>
              morph · link scale <span className="text-primary">→</span> outcome scale
            </span>
            <span className="font-mono text-xs">{t.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={t}
            onChange={(e) => setT(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="text-sm text-secondary">
          <span className="flex justify-between">
            <span>probe x</span>
            <span className="font-mono text-xs">{probeX.toFixed(1)}</span>
          </span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={probeX}
            onChange={(e) => setProbeX(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="text-sm text-secondary">
          <span className="flex justify-between">
            <span>intercept α</span>
            <span className="font-mono text-xs">{alpha.toFixed(1)}</span>
          </span>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
        <label className="text-sm text-secondary">
          <span className="flex justify-between">
            <span>slope β</span>
            <span className="font-mono text-xs">{beta.toFixed(1)}</span>
          </span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            className="mt-1 w-full accent-(--brass-400)"
          />
        </label>
      </div>

      <div className="mt-3 rounded-card border border-line p-4 font-mono text-xs">
        <span className="text-secondary">at x = {probeX.toFixed(1)}: </span>
        <span>η = {probeEta.toFixed(2)}</span>
        <span className="text-secondary"> → </span>
        <span>
          {link === 'logit' ? 'p' : 'λ'} ={' '}
          {link === 'logit' ? probeMu.toFixed(3) : probeMu.toFixed(2)}
        </span>
        <span className="ml-4 text-secondary">outcome-scale slope: </span>
        <span className="text-accent-bright">{probeSlope.toFixed(3)}</span>
        <span className="text-secondary"> (β stays {beta.toFixed(1)} on the link scale)</span>
      </div>
    </div>
  )
}
