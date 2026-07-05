/**
 * lynx-hare-ode engine — the predator–prey dynamics of §16.5.
 *
 * The Lotka–Volterra equations turn a verbal story about hares and lynx
 * into two coupled differential equations:
 *
 *   dH/dt = H (b_H − m_H · L)      hares breed, lynx eat them
 *   dL/dt = L (b_L · H − m_L)      lynx breed by eating, and starve
 *
 * There is no closed form, so the golem of chapter 16 must *solve* the
 * model to make predictions — here with a fourth-order Runge–Kutta step in
 * JavaScript. The trajectory is a closed loop in the (hare, lynx) plane;
 * the four rates set its centre and its swing. Pure logic, no React.
 */
import { RNG } from '../../../lib/rng'

export interface LvParams {
  /** hare birth rate */
  bH: number
  /** hare mortality per lynx */
  mH: number
  /** lynx birth per hare */
  bL: number
  /** lynx death rate */
  mL: number
}

export type State = [number, number]

/** The vector field [dH/dt, dL/dt]. */
export function derivative([h, l]: State, p: LvParams): State {
  return [h * (p.bH - p.mH * l), l * (p.bL * h - p.mL)]
}

/** One classical RK4 step of size dt. */
export function rk4Step(s: State, p: LvParams, dt: number): State {
  const k1 = derivative(s, p)
  const k2 = derivative([s[0] + (dt / 2) * k1[0], s[1] + (dt / 2) * k1[1]], p)
  const k3 = derivative([s[0] + (dt / 2) * k2[0], s[1] + (dt / 2) * k2[1]], p)
  const k4 = derivative([s[0] + dt * k3[0], s[1] + dt * k3[1]], p)
  const h = s[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
  const l = s[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
  // populations cannot go negative; clamp numerical undershoot
  return [Math.max(h, 0), Math.max(l, 0)]
}

export interface Trace {
  t: number[]
  H: number[]
  L: number[]
}

/** Integrate from an initial state over [0, tMax] at step dt. */
export function integrate(p: LvParams, init: State, tMax: number, dt = 0.02): Trace {
  const steps = Math.round(tMax / dt)
  const t: number[] = new Array(steps + 1)
  const H: number[] = new Array(steps + 1)
  const L: number[] = new Array(steps + 1)
  let s = init
  for (let i = 0; i <= steps; i++) {
    t[i] = i * dt
    H[i] = s[0]
    L[i] = s[1]
    s = rk4Step(s, p, dt)
  }
  return { t, H, L }
}

/** The interior fixed point the orbit circles: (m_L/b_L, b_H/m_H). */
export function equilibrium(p: LvParams): State {
  return [p.mL / p.bL, p.bH / p.mH]
}

/**
 * A small ensemble of orbits from parameters jittered around p — the
 * posterior-draw spread the phase portrait shows as faint loops.
 */
export function ensemble(
  p: LvParams,
  init: State,
  tMax: number,
  n = 6,
  seed = 1959,
): Trace[] {
  const rng = new RNG(seed, 16)
  const out: Trace[] = []
  for (let i = 0; i < n; i++) {
    const jitter = (v: number) => v * Math.exp(rng.normal(0, 0.06))
    out.push(
      integrate(
        { bH: jitter(p.bH), mH: jitter(p.mH), bL: jitter(p.bL), mL: jitter(p.mL) },
        init,
        tMax,
      ),
    )
  }
  return out
}

/**
 * The Hudson's Bay Company pelt record (MacLulich 1937), thousands of
 * pelts, 1900–1920. Shipped for overlay; the ODE is not fit to it here.
 */
export const LYNX_HARE: { year: number; hare: number; lynx: number }[] = [
  { year: 1900, hare: 30.0, lynx: 4.0 },
  { year: 1901, hare: 47.2, lynx: 6.1 },
  { year: 1902, hare: 70.2, lynx: 9.8 },
  { year: 1903, hare: 77.4, lynx: 35.2 },
  { year: 1904, hare: 36.3, lynx: 59.4 },
  { year: 1905, hare: 20.6, lynx: 41.7 },
  { year: 1906, hare: 18.1, lynx: 19.0 },
  { year: 1907, hare: 21.4, lynx: 13.0 },
  { year: 1908, hare: 22.0, lynx: 8.3 },
  { year: 1909, hare: 25.4, lynx: 9.1 },
  { year: 1910, hare: 27.1, lynx: 7.4 },
  { year: 1911, hare: 40.3, lynx: 8.0 },
  { year: 1912, hare: 57.0, lynx: 12.3 },
  { year: 1913, hare: 76.6, lynx: 19.5 },
  { year: 1914, hare: 52.3, lynx: 45.7 },
  { year: 1915, hare: 19.5, lynx: 51.1 },
  { year: 1916, hare: 11.2, lynx: 29.7 },
  { year: 1917, hare: 7.6, lynx: 15.8 },
  { year: 1918, hare: 14.6, lynx: 9.7 },
  { year: 1919, hare: 16.2, lynx: 10.1 },
  { year: 1920, hare: 24.7, lynx: 8.6 },
]

export const DEFAULTS: LvParams = { bH: 0.5, mH: 0.025, bL: 0.025, mL: 0.75 }
export const INIT: State = [30, 5]
