/**
 * rng.ts — seeded PCG32 random number generator.
 *
 * Every engine in the app draws randomness through this class so that
 * interactives are deterministic under a fixed seed (CLAUDE.md §3).
 * PCG32: 64-bit LCG state advanced per O'Neill (2014), output via
 * XSH-RR. Implemented on BigInt for the state arithmetic; outputs are
 * plain numbers.
 */

const MULT = 6364136223846793005n
const MASK64 = (1n << 64n) - 1n

export class RNG {
  private state: bigint
  private readonly inc: bigint

  constructor(seed: number | bigint, streamId: number | bigint = 54n) {
    const seedB = BigInt(seed) & MASK64
    this.inc = ((BigInt(streamId) << 1n) | 1n) & MASK64
    this.state = 0n
    this.nextUint32()
    this.state = (this.state + seedB) & MASK64
    this.nextUint32()
  }

  /** Next raw 32-bit unsigned integer. */
  nextUint32(): number {
    const old = this.state
    this.state = (old * MULT + this.inc) & MASK64
    const xorshifted = Number(((old >> 18n) ^ old) >> 27n & 0xffffffffn)
    const rot = Number(old >> 59n)
    return ((xorshifted >>> rot) | (xorshifted << (-rot & 31))) >>> 0
  }

  /** Uniform in [0, 1). 32 bits of resolution — plenty for visualization. */
  uniform(): number {
    return this.nextUint32() / 4294967296
  }

  /** Uniform integer in [0, n). */
  int(n: number): number {
    if (!Number.isInteger(n) || n <= 0) {
      throw new RangeError(`int(n) expects a positive integer, got ${n}`)
    }
    // Rejection sampling to avoid modulo bias.
    const threshold = 4294967296 - (4294967296 % n)
    let x: number
    do {
      x = this.nextUint32()
    } while (x >= threshold)
    return x % n
  }

  /** Standard normal via Box–Muller (polar form avoided; log/cos is fine here). */
  normal(mean = 0, sd = 1): number {
    let u1 = this.uniform()
    while (u1 === 0) u1 = this.uniform()
    const u2 = this.uniform()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + sd * z
  }

  /** Gamma(shape, 1) via Marsaglia–Tsang; shape > 0. */
  gamma(shape: number): number {
    if (shape <= 0) throw new RangeError(`gamma shape must be > 0, got ${shape}`)
    if (shape < 1) {
      // Boost: G(a) = G(a+1) * U^(1/a)
      const u = this.uniform()
      return this.gamma(shape + 1) * Math.pow(u, 1 / shape)
    }
    const d = shape - 1 / 3
    const c = 1 / Math.sqrt(9 * d)
    for (;;) {
      let x: number
      let v: number
      do {
        x = this.normal()
        v = 1 + c * x
      } while (v <= 0)
      v = v * v * v
      const u = this.uniform()
      if (u < 1 - 0.0331 * x * x * x * x) return d * v
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
    }
  }

  /** Beta(a, b) as ratio of gammas. */
  beta(a: number, b: number): number {
    const x = this.gamma(a)
    const y = this.gamma(b)
    return x / (x + y)
  }

  /** Binomial(n, p) by direct simulation — n stays small in this course. */
  binomial(n: number, p: number): number {
    let k = 0
    for (let i = 0; i < n; i++) if (this.uniform() < p) k++
    return k
  }

  /** Sample one index from unnormalized weights. */
  categorical(weights: readonly number[]): number {
    let total = 0
    for (const w of weights) {
      if (w < 0 || !Number.isFinite(w)) {
        throw new RangeError('categorical weights must be finite and non-negative')
      }
      total += w
    }
    if (total <= 0) throw new RangeError('categorical weights sum to zero')
    let r = this.uniform() * total
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]!
      if (r < 0) return i
    }
    return weights.length - 1
  }

  /** Fisher–Yates shuffle (returns a new array). */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1)
      const tmp = out[i]!
      out[i] = out[j]!
      out[j] = tmp
    }
    return out
  }
}

/** The house seed: the Golem of Prague film year. */
export const HOUSE_SEED = 1959
