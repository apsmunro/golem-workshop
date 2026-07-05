/**
 * link-morpher engine — the geometry of link functions.
 *
 * A GLM is a straight line living on the link scale and a curve living
 * on the outcome scale. The morph parameter t slides between the two
 * pictures: at t = 0 the linear predictor η(x) plotted on its own axis,
 * at t = 1 the inverse-linked mean μ(x) on the outcome axis, in between
 * a pointwise interpolation of the two plot positions. Gridlines at
 * equal η spacing travel with the morph so their bunching near the
 * floor and ceiling is visible.
 */

export type Link = 'logit' | 'log'

export function invLogit(eta: number): number {
  // guard both tails so the plot math never sees 0/1 exactly
  if (eta > 35) return 1
  if (eta < -35) return 0
  return 1 / (1 + Math.exp(-eta))
}

export function invLink(link: Link, eta: number): number {
  return link === 'logit' ? invLogit(eta) : Math.exp(eta)
}

/** dμ/dx at a point: the outcome-scale slope, which is never just β. */
export function outcomeSlope(link: Link, eta: number, beta: number): number {
  if (link === 'logit') {
    const p = invLogit(eta)
    return beta * p * (1 - p)
  }
  return beta * Math.exp(eta)
}

export interface MorphConfig {
  link: Link
  alpha: number
  beta: number
  /** x sampling range */
  xLo: number
  xHi: number
  /** η range mapped onto the vertical axis at t = 0 */
  etaLo: number
  etaHi: number
  /** outcome range mapped onto the vertical axis at t = 1 */
  muLo: number
  muHi: number
}

/** Vertical plot fraction (0 = bottom, 1 = top) of a point at morph t. */
export function morphFraction(cfg: MorphConfig, x: number, t: number): number {
  const eta = cfg.alpha + cfg.beta * x
  const fEta = (eta - cfg.etaLo) / (cfg.etaHi - cfg.etaLo)
  const mu = invLink(cfg.link, eta)
  const fMu = (mu - cfg.muLo) / (cfg.muHi - cfg.muLo)
  const f = (1 - t) * fEta + t * fMu
  return Math.max(-0.2, Math.min(1.2, f))
}

/**
 * Horizontal gridlines drawn at equal steps of η. Each returns its
 * vertical fraction at morph t: evenly spaced at t = 0, bunched by the
 * inverse link at t = 1.
 */
export function gridlineFractions(cfg: MorphConfig, t: number, n = 9): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const eta = cfg.etaLo + ((i + 0.5) / n) * (cfg.etaHi - cfg.etaLo)
    const fEta = (eta - cfg.etaLo) / (cfg.etaHi - cfg.etaLo)
    const mu = invLink(cfg.link, eta)
    const fMu = (mu - cfg.muLo) / (cfg.muHi - cfg.muLo)
    out.push((1 - t) * fEta + t * fMu)
  }
  return out
}

/** Sensible default vertical ranges per link. */
export function defaultConfig(link: Link, alpha: number, beta: number): MorphConfig {
  const xLo = -3
  const xHi = 3
  // widest η the sliders can produce over x ∈ [−3, 3]
  const etaSpan = Math.abs(beta) * 3 + Math.abs(alpha)
  const etaMax = Math.max(4, etaSpan)
  return {
    link,
    alpha,
    beta,
    xLo,
    xHi,
    etaLo: -etaMax,
    etaHi: etaMax,
    muLo: 0,
    muHi: link === 'logit' ? 1 : Math.exp(etaMax) * 0.6,
  }
}
