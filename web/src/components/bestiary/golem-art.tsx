/**
 * Golem art — engraved inline SVG, house style (CLAUDE.md §2.4):
 * 1.5px line work, clay bodies, bone engraving, brass eyes. No gradients.
 *
 * Each golem is built from named fragment groups. `dismembered` scatters
 * the fragments (used by the forging ceremony, which then removes the
 * prop to let CSS transitions assemble the creature).
 */
import type { ReactNode } from 'react'

export type GolemArtState = 'unforged' | 'forged'

interface GolemArtProps {
  state?: GolemArtState
  dismembered?: boolean
  className?: string
}

function Fragment({
  offset,
  dismembered,
  children,
}: {
  offset: string
  dismembered: boolean
  children: ReactNode
}) {
  return (
    <g
      style={{
        transform: dismembered ? offset : 'translate(0px, 0px) rotate(0deg)',
        opacity: dismembered ? 0 : 1,
        transition:
          'transform 1100ms cubic-bezier(0.22, 1, 0.36, 1), opacity 900ms ease-out',
        transformOrigin: '60px 70px',
      }}
    >
      {children}
    </g>
  )
}

export function GlobeTossingGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      role="img"
      aria-label={`Globe-Tossing Golem, ${state}`}
    >
      {/* globe, held aloft */}
      <Fragment offset="translate(-26px, -18px) rotate(-40deg)" dismembered={dismembered}>
        <circle cx="60" cy="24" r="15" fill="none" stroke={bone} strokeWidth={sw} />
        <ellipse cx="60" cy="24" rx="15" ry="5.5" fill="none" stroke={bone} strokeWidth="1" />
        <ellipse cx="60" cy="24" rx="6" ry="15" fill="none" stroke={bone} strokeWidth="1" />
        <path d="M47 19 Q60 13 73 19" fill="none" stroke={bone} strokeWidth="1" />
        <path d="M47 30 Q60 36 73 30" fill="none" stroke={bone} strokeWidth="1" />
      </Fragment>

      {/* arms raised to the globe */}
      <Fragment offset="translate(30px, 8px) rotate(35deg)" dismembered={dismembered}>
        <path d="M44 68 L34 48 L46 36" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M76 68 L86 48 L74 36" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>

      {/* head with the brass eyes and forehead mark */}
      <Fragment offset="translate(14px, -26px) rotate(24deg)" dismembered={dismembered}>
        <path d="M50 62 L50 46 Q50 40 56 40 L64 40 Q70 40 70 46 L70 62" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="56" cy="52" r="1.8" fill={brass} />
        <circle cx="64" cy="52" r="1.8" fill={brass} />
        <path d="M58 44 L60 46 L62 44" fill="none" stroke={brass} strokeWidth="1" />
      </Fragment>

      {/* torso, engraved */}
      <Fragment offset="translate(-22px, 20px) rotate(-18deg)" dismembered={dismembered}>
        <path d="M46 62 L74 62 Q78 62 78 68 L76 108 L44 108 L42 68 Q42 62 46 62 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M47 74 L73 74" stroke={bone} strokeWidth="0.8" />
        <path d="M47 84 L73 84" stroke={bone} strokeWidth="0.8" />
        <path d="M48 94 L72 94" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(8px, 30px) rotate(14deg)" dismembered={dismembered}>
        <path d="M48 108 L47 136 L57 136 L57 108" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M63 108 L63 136 L73 136 L72 108" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function SamplerSprite({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      role="img"
      aria-label={`Sampler Sprite, ${state}`}
    >
      {/* the urn of the posterior */}
      <Fragment offset="translate(-24px, 16px) rotate(-20deg)" dismembered={dismembered}>
        <path d="M28 96 Q22 100 22 112 Q22 130 38 134 L46 134 Q54 130 54 112 Q54 100 48 96 Q56 92 56 88 L20 88 Q20 92 28 96 Z" fill="none" stroke={bone} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M26 106 L50 106" stroke={bone} strokeWidth="0.8" />
        <path d="M25 118 L51 118" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* sprite body, leaning over the urn */}
      <Fragment offset="translate(26px, -10px) rotate(28deg)" dismembered={dismembered}>
        <path d="M66 76 Q76 72 82 80 L86 108 Q86 118 76 120 L70 120 Q64 112 66 100 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M72 120 L68 138 M80 120 L82 138" stroke={clay} strokeWidth={sw} />
      </Fragment>

      {/* hooded head */}
      <Fragment offset="translate(12px, -30px) rotate(-30deg)" dismembered={dismembered}>
        <path d="M64 74 Q60 58 74 52 Q88 56 84 74 Q74 80 64 74 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M74 52 L78 40" stroke={clay} strokeWidth={sw} />
        <circle cx="72" cy="66" r="1.8" fill={brass} />
      </Fragment>

      {/* the ladle arm, dipping */}
      <Fragment offset="translate(-18px, -24px) rotate(40deg)" dismembered={dismembered}>
        <path d="M68 84 L48 92" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M48 92 L40 100 Q36 106 42 108 Q48 106 46 100 Z" fill="none" stroke={bone} strokeWidth="1.2" strokeLinejoin="round" />
      </Fragment>

      {/* draws, scattered up and out of the urn */}
      <Fragment offset="translate(18px, 26px) rotate(16deg)" dismembered={dismembered}>
        <circle cx="44" cy="70" r="1.6" fill={brass} />
        <circle cx="52" cy="56" r="1.6" fill={brass} />
        <circle cx="42" cy="44" r="1.6" fill={brass} />
        <circle cx="56" cy="34" r="1.6" fill={brass} />
        <circle cx="46" cy="24" r="1.6" fill={brass} />
        <path d="M40 78 Q50 50 46 20" fill="none" stroke={brass} strokeWidth="0.6" opacity="0.5" />
      </Fragment>
    </svg>
  )
}

export function GaussianGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Gaussian Golem, ${state}`}>
      {/* the bell curve crown */}
      <Fragment offset="translate(0px, -30px) rotate(0deg)" dismembered={dismembered}>
        <path d="M32 40 C44 40 44 16 60 16 C76 16 76 40 88 40" fill="none" stroke={brass} strokeWidth={sw} />
        <path d="M32 40 C44 40 44 16 60 16 C76 16 76 40 88 40 L88 44 L32 44 Z" fill={brass} opacity="0.08" stroke="none" />
      </Fragment>

      {/* head */}
      <Fragment offset="translate(0px, -20px) rotate(0deg)" dismembered={dismembered}>
        <rect x="48" y="44" width="24" height="22" rx="3" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="55" cy="55" r="1.8" fill={brass} />
        <circle cx="65" cy="55" r="1.8" fill={brass} />
      </Fragment>

      {/* torso engraved with a symmetric axis */}
      <Fragment offset="translate(-22px, 14px) rotate(-16deg)" dismembered={dismembered}>
        <path d="M44 66 L76 66 Q80 66 80 72 L78 110 L42 110 L40 72 Q40 66 44 66 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="60" y1="70" x2="60" y2="106" stroke={bone} strokeWidth="0.8" strokeDasharray="2 3" />
        <path d="M48 96 C54 96 54 84 60 84 C66 84 66 96 72 96" fill="none" stroke={bone} strokeWidth="0.9" />
      </Fragment>

      {/* arms */}
      <Fragment offset="translate(28px, 6px) rotate(30deg)" dismembered={dismembered}>
        <path d="M44 74 L30 86 M76 74 L90 86" fill="none" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(6px, 28px) rotate(12deg)" dismembered={dismembered}>
        <path d="M48 110 L47 136 L57 136 L57 110 M63 110 L63 136 L73 136 L72 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function MultivariableGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Multivariable Golem, ${state}`}>
      {/* three-node crown: many variables feeding one head */}
      <Fragment offset="translate(0px, -30px) rotate(0deg)" dismembered={dismembered}>
        <circle cx="34" cy="20" r="5" fill="none" stroke={brass} strokeWidth={sw} />
        <circle cx="60" cy="14" r="5" fill="none" stroke={brass} strokeWidth={sw} />
        <circle cx="86" cy="20" r="5" fill="none" stroke={brass} strokeWidth={sw} />
        <path d="M37 24 L54 40 M60 19 L60 40 M83 24 L66 40" fill="none" stroke={bone} strokeWidth="1" />
      </Fragment>

      {/* head */}
      <Fragment offset="translate(0px, -18px) rotate(0deg)" dismembered={dismembered}>
        <path d="M48 62 L48 46 Q48 40 54 40 L66 40 Q72 40 72 46 L72 62 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="55" cy="51" r="1.8" fill={brass} />
        <circle cx="65" cy="51" r="1.8" fill={brass} />
      </Fragment>

      {/* broad torso, three engraved columns */}
      <Fragment offset="translate(-24px, 16px) rotate(-14deg)" dismembered={dismembered}>
        <path d="M42 62 L78 62 Q82 62 82 68 L80 110 L40 110 L38 68 Q38 62 42 62 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="52" y1="70" x2="52" y2="104" stroke={bone} strokeWidth="0.8" />
        <line x1="60" y1="70" x2="60" y2="104" stroke={bone} strokeWidth="0.8" />
        <line x1="68" y1="70" x2="68" y2="104" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(6px, 28px) rotate(12deg)" dismembered={dismembered}>
        <path d="M48 110 L47 136 L57 136 L57 110 M63 110 L63 136 L73 136 L72 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function HauntedDagGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const plum = state === 'forged' ? 'var(--plum-500)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Haunted DAG Charm, ${state}`}>
      {/* the ghost — an unobserved confounder hovering above */}
      <Fragment offset="translate(0px, -34px) rotate(0deg)" dismembered={dismembered}>
        <path d="M46 30 Q46 12 60 12 Q74 12 74 30 L74 40 L70 36 L66 40 L62 36 L58 40 L54 36 L50 40 L46 36 Z" fill={plum} opacity="0.12" stroke={plum} strokeWidth={sw} strokeLinejoin="round" strokeDasharray="3 3" />
        <circle cx="55" cy="26" r="1.6" fill={plum} />
        <circle cx="65" cy="26" r="1.6" fill={plum} />
      </Fragment>

      {/* the collider node the charm warns about */}
      <Fragment offset="translate(-22px, 6px) rotate(-18deg)" dismembered={dismembered}>
        <circle cx="60" cy="66" r="14" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="54" cy="64" r="1.8" fill={brass} />
        <circle cx="66" cy="64" r="1.8" fill={brass} />
        <path d="M53 73 Q60 69 67 73" fill="none" stroke={bone} strokeWidth="1" />
      </Fragment>

      {/* two arrows colliding into it (the fork of the haunting) */}
      <Fragment offset="translate(24px, 10px) rotate(24deg)" dismembered={dismembered}>
        <path d="M34 96 L50 74 M86 96 L70 74" fill="none" stroke={bone} strokeWidth="1.2" />
        <path d="M50 74 l-5 1 l3 4 Z M70 74 l5 1 l-3 4 Z" fill={bone} />
      </Fragment>

      {/* base */}
      <Fragment offset="translate(0px, 30px) rotate(0deg)" dismembered={dismembered}>
        <path d="M40 108 L80 108 L84 126 L36 126 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M44 116 L76 116" stroke={bone} strokeWidth="0.8" />
      </Fragment>
    </svg>
  )
}

export function CompassOfUlysses({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Compass of Ulysses, ${state}`}>
      {/* gimbal ring with degree ticks */}
      <Fragment offset="translate(-24px, -16px) rotate(-30deg)" dismembered={dismembered}>
        <circle cx="60" cy="66" r="34" fill="none" stroke={bone} strokeWidth={sw} />
        <circle cx="60" cy="66" r="28" fill="none" stroke={bone} strokeWidth="0.8" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8
          const x1 = 60 + 34 * Math.cos(a)
          const y1 = 66 + 34 * Math.sin(a)
          const x2 = 60 + 31 * Math.cos(a)
          const y2 = 66 + 31 * Math.sin(a)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={bone} strokeWidth="0.8" />
        })}
      </Fragment>

      {/* the rose: two scylla-and-charybdis points, overfit and underfit */}
      <Fragment offset="translate(26px, 12px) rotate(38deg)" dismembered={dismembered}>
        <path d="M60 44 L64 62 L60 66 L56 62 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M60 88 L64 70 L60 66 L56 70 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M38 66 L56 62 L60 66 L56 70 Z" fill="none" stroke={clay} strokeWidth="1" strokeLinejoin="round" />
        <path d="M82 66 L64 62 L60 66 L64 70 Z" fill="none" stroke={clay} strokeWidth="1" strokeLinejoin="round" />
      </Fragment>

      {/* the needle, steering between the monsters */}
      <Fragment offset="translate(-14px, 24px) rotate(-52deg)" dismembered={dismembered}>
        <path d="M44 82 L76 50" stroke={brass} strokeWidth={sw} />
        <path d="M76 50 l-7 2 l4 4 Z" fill={brass} />
        <circle cx="60" cy="66" r="3" fill={brass} />
      </Fragment>

      {/* stand and keel */}
      <Fragment offset="translate(8px, 28px) rotate(16deg)" dismembered={dismembered}>
        <path d="M60 100 L60 116 M44 128 Q60 118 76 128" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M40 132 L80 132 L76 140 L44 140 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M48 136 L72 136" stroke={bone} strokeWidth="0.8" />
      </Fragment>
    </svg>
  )
}

export function ManateeGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Manatee Golem, ${state}`}>
      {/* head and whiskered snout */}
      <Fragment offset="translate(-20px, -22px) rotate(-26deg)" dismembered={dismembered}>
        <path d="M34 52 Q34 34 52 34 Q66 34 68 46" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="46" cy="46" r="1.8" fill={brass} />
        <path d="M34 52 Q30 56 33 60 M38 54 L34 58 M42 55 L39 60" fill="none" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* the round, unhurried body with engraved currents */}
      <Fragment offset="translate(24px, 4px) rotate(20deg)" dismembered={dismembered}>
        <path d="M34 52 Q28 78 44 96 Q58 110 76 102 Q92 94 90 72 Q88 52 68 46" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M44 62 Q58 70 74 64" fill="none" stroke={bone} strokeWidth="0.8" />
        <path d="M42 76 Q58 84 78 76" fill="none" stroke={bone} strokeWidth="0.8" />
        <path d="M46 90 Q60 96 76 90" fill="none" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* flipper, folded like a spline knot */}
      <Fragment offset="translate(-26px, 18px) rotate(-34deg)" dismembered={dismembered}>
        <path d="M52 74 Q42 84 48 94 Q54 100 60 94" fill="none" stroke={clay} strokeWidth={sw} />
      </Fragment>

      {/* paddle tail */}
      <Fragment offset="translate(18px, 30px) rotate(30deg)" dismembered={dismembered}>
        <path d="M76 102 Q84 112 80 124 Q70 138 56 130 Q48 124 54 114" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M62 118 Q68 124 74 118" fill="none" stroke={bone} strokeWidth="0.8" />
      </Fragment>
    </svg>
  )
}

export function McmcEngineCore({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`MCMC Engine Core, ${state}`}>
      {/* outer gimbal */}
      <Fragment offset="translate(-26px, -14px) rotate(-36deg)" dismembered={dismembered}>
        <ellipse cx="60" cy="66" rx="36" ry="36" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="60" cy="30" r="2.4" fill="none" stroke={bone} strokeWidth="1" />
        <circle cx="60" cy="102" r="2.4" fill="none" stroke={bone} strokeWidth="1" />
      </Fragment>

      {/* inner rings, tilted */}
      <Fragment offset="translate(28px, -8px) rotate(40deg)" dismembered={dismembered}>
        <ellipse cx="60" cy="66" rx="28" ry="12" fill="none" stroke={bone} strokeWidth="1" transform="rotate(-24 60 66)" />
        <ellipse cx="60" cy="66" rx="12" ry="26" fill="none" stroke={bone} strokeWidth="1" transform="rotate(18 60 66)" />
      </Fragment>

      {/* the marble mid-trajectory */}
      <Fragment offset="translate(-16px, 26px) rotate(-20deg)" dismembered={dismembered}>
        <path d="M38 84 Q46 60 60 58 Q74 56 78 44" fill="none" stroke={brass} strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="78" cy="44" r="4" fill={brass} />
      </Fragment>

      {/* mount and furnace base */}
      <Fragment offset="translate(10px, 30px) rotate(18deg)" dismembered={dismembered}>
        <path d="M60 102 L60 116" stroke={clay} strokeWidth={sw} />
        <path d="M42 116 L78 116 L84 138 L36 138 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M46 124 L74 124 M48 131 L72 131" stroke={bone} strokeWidth="0.8" />
      </Fragment>
    </svg>
  )
}

export function GlmPrism({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const verd = state === 'forged' ? 'var(--verdigris-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`GLM Prism, ${state}`}>
      {/* a straight ray enters — the linear predictor on the link scale */}
      <Fragment offset="translate(-30px, -10px) rotate(-30deg)" dismembered={dismembered}>
        <path d="M8 52 L46 62" fill="none" stroke={bone} strokeWidth="1.2" />
      </Fragment>

      {/* the prism head, a tilted triangle of glass */}
      <Fragment offset="translate(0px, -26px) rotate(0deg)" dismembered={dismembered}>
        <path d="M46 40 L74 52 L50 74 Z" fill={brass} opacity="0.08" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="54" cy="54" r="1.6" fill={brass} />
        <circle cx="61" cy="57" r="1.6" fill={brass} />
      </Fragment>

      {/* the fan of curved rays leaving — one line, refracted onto bounded scales */}
      <Fragment offset="translate(26px, 8px) rotate(30deg)" dismembered={dismembered}>
        <path d="M62 64 Q92 62 104 44" fill="none" stroke={brass} strokeWidth="1.2" />
        <path d="M62 66 Q94 70 108 66" fill="none" stroke={verd} strokeWidth="1.2" />
        <path d="M62 68 Q92 78 102 92" fill="none" stroke={clay} strokeWidth="1.2" />
      </Fragment>

      {/* body: an instrument stand holding the glass */}
      <Fragment offset="translate(-20px, 22px) rotate(-14deg)" dismembered={dismembered}>
        <path d="M50 74 L58 74 L58 108 L44 108 L44 100 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M47 86 L56 86 M46 94 L56 94" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* tripod base */}
      <Fragment offset="translate(8px, 30px) rotate(14deg)" dismembered={dismembered}>
        <path d="M51 108 L40 138 M51 108 L62 138 M51 108 L51 138" fill="none" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
        <path d="M40 138 L62 138" stroke={bone} strokeWidth="0.8" />
      </Fragment>
    </svg>
  )
}

export function IntegerGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Integer Golem, ${state}`}>
      {/* an abacus crown — counts, never fractions */}
      <Fragment offset="translate(0px, -30px) rotate(0deg)" dismembered={dismembered}>
        <rect x="38" y="14" width="44" height="24" rx="2" fill="none" stroke={clay} strokeWidth={sw} />
        <line x1="38" y1="22" x2="82" y2="22" stroke={bone} strokeWidth="0.8" />
        <line x1="38" y1="30" x2="82" y2="30" stroke={bone} strokeWidth="0.8" />
        <circle cx="46" cy="22" r="2" fill={brass} />
        <circle cx="54" cy="22" r="2" fill={brass} />
        <circle cx="70" cy="22" r="2" fill={brass} />
        <circle cx="50" cy="30" r="2" fill={brass} />
        <circle cx="66" cy="30" r="2" fill={brass} />
      </Fragment>

      {/* blocky head with tally eyes */}
      <Fragment offset="translate(0px, -18px) rotate(0deg)" dismembered={dismembered}>
        <rect x="48" y="42" width="24" height="22" rx="2" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="55" cy="53" r="1.8" fill={brass} />
        <circle cx="65" cy="53" r="1.8" fill={brass} />
      </Fragment>

      {/* torso: a staircase of counts, discrete steps */}
      <Fragment offset="translate(-22px, 16px) rotate(-14deg)" dismembered={dismembered}>
        <path d="M44 64 L76 64 Q80 64 80 70 L78 108 L42 108 L40 70 Q40 64 44 64 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M46 100 L46 92 L54 92 L54 84 L62 84 L62 76 L70 76 L70 70" fill="none" stroke={bone} strokeWidth="1" strokeLinejoin="round" />
      </Fragment>

      {/* arms holding a counting rod */}
      <Fragment offset="translate(28px, 6px) rotate(28deg)" dismembered={dismembered}>
        <path d="M44 72 L32 82 M76 72 L88 82" fill="none" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
        <path d="M30 82 L90 82" stroke={bone} strokeWidth="1" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(6px, 28px) rotate(12deg)" dismembered={dismembered}>
        <path d="M48 108 L47 136 L57 136 L57 108 M63 108 L63 136 L73 136 L72 108" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function MemoryGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Memory Golem, ${state}`}>
      {/* a crown of nested tanks — clusters remembering each other */}
      <Fragment offset="translate(0px, -32px) rotate(0deg)" dismembered={dismembered}>
        <path d="M40 34 Q40 20 60 20 Q80 20 80 34" fill="none" stroke={brass} strokeWidth={sw} />
        <path d="M46 34 Q46 25 60 25 Q74 25 74 34" fill="none" stroke={bone} strokeWidth="0.9" />
        <path d="M52 34 Q52 30 60 30 Q68 30 68 34" fill="none" stroke={bone} strokeWidth="0.9" />
      </Fragment>

      {/* head, a small pooled tadpole eye */}
      <Fragment offset="translate(0px, -18px) rotate(0deg)" dismembered={dismembered}>
        <rect x="48" y="40" width="24" height="22" rx="4" fill="none" stroke={clay} strokeWidth={sw} />
        <circle cx="55" cy="51" r="1.8" fill={brass} />
        <circle cx="65" cy="51" r="1.8" fill={brass} />
      </Fragment>

      {/* torso engraved with three tanks shrinking toward a shared line */}
      <Fragment offset="translate(-22px, 16px) rotate(-15deg)" dismembered={dismembered}>
        <path d="M44 62 L76 62 Q80 62 80 68 L78 110 L42 110 L40 68 Q40 62 44 62 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="46" y1="86" x2="74" y2="86" stroke={brass} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50" cy="76" r="1.6" fill="none" stroke={bone} strokeWidth="1" />
        <circle cx="60" cy="94" r="1.6" fill="none" stroke={bone} strokeWidth="1" />
        <circle cx="70" cy="80" r="1.6" fill="none" stroke={bone} strokeWidth="1" />
        <path d="M50 78 L50 85 M60 92 L60 87 M70 82 L70 85" stroke={brass} strokeWidth="0.8" />
      </Fragment>

      {/* arms cradling a small tank */}
      <Fragment offset="translate(28px, 6px) rotate(28deg)" dismembered={dismembered}>
        <path d="M44 72 L34 84 M76 72 L86 84" fill="none" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(6px, 28px) rotate(12deg)" dismembered={dismembered}>
        <path d="M48 110 L47 136 L57 136 L57 110 M63 110 L63 136 L73 136 L72 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function CovarianceHydra({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const verd = state === 'forged' ? 'var(--verdigris-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Covariance Hydra, ${state}`}>
      {/* two heads on correlated necks — parameters that vary together */}
      <Fragment offset="translate(-24px, -28px) rotate(-30deg)" dismembered={dismembered}>
        <path d="M52 68 Q40 52 36 34" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M32 30 Q28 24 34 20 Q42 22 40 30 Q36 34 32 30 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="35" cy="26" r="1.5" fill={brass} />
      </Fragment>
      <Fragment offset="translate(24px, -28px) rotate(30deg)" dismembered={dismembered}>
        <path d="M68 68 Q80 52 84 34" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M88 30 Q92 24 86 20 Q78 22 80 30 Q84 34 88 30 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="85" cy="26" r="1.5" fill={brass} />
      </Fragment>

      {/* the covariance ellipse binding the necks */}
      <Fragment offset="translate(0px, -20px) rotate(0deg)" dismembered={dismembered}>
        <ellipse cx="60" cy="40" rx="20" ry="9" fill={verd} opacity="0.1" stroke={verd} strokeWidth="1.2" transform="rotate(-24 60 40)" />
      </Fragment>

      {/* body: a coiled trunk with an engraved 2×2 matrix */}
      <Fragment offset="translate(-20px, 18px) rotate(-16deg)" dismembered={dismembered}>
        <path d="M46 66 Q40 80 46 94 Q52 108 60 108 Q68 108 74 94 Q80 80 74 66 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="52" y="78" width="16" height="16" fill="none" stroke={bone} strokeWidth="0.8" />
        <line x1="60" y1="78" x2="60" y2="94" stroke={bone} strokeWidth="0.6" />
        <line x1="52" y1="86" x2="68" y2="86" stroke={bone} strokeWidth="0.6" />
        <circle cx="56" cy="82" r="1.2" fill={brass} />
        <circle cx="64" cy="90" r="1.2" fill={brass} />
        <circle cx="64" cy="82" r="1.2" fill={verd} />
        <circle cx="56" cy="90" r="1.2" fill={verd} />
      </Fragment>

      {/* two curling tails */}
      <Fragment offset="translate(10px, 30px) rotate(18deg)" dismembered={dismembered}>
        <path d="M52 108 Q46 124 52 134 Q56 138 60 134" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M68 108 Q74 124 68 134 Q64 138 60 134" fill="none" stroke={clay} strokeWidth={sw} />
      </Fragment>
    </svg>
  )
}

export function MonsterMixer({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const plum = state === 'forged' ? 'var(--plum-500)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Monster Mixer, ${state}`}>
      {/* two spouts feeding one cauldron — two processes, one observation */}
      <Fragment offset="translate(-16px, -30px) rotate(-24deg)" dismembered={dismembered}>
        <path d="M40 20 Q40 34 50 40" fill="none" stroke={plum} strokeWidth={sw} />
        <circle cx="40" cy="18" r="4" fill="none" stroke={plum} strokeWidth={sw} />
      </Fragment>
      <Fragment offset="translate(16px, -30px) rotate(24deg)" dismembered={dismembered}>
        <path d="M80 20 Q80 34 70 40" fill="none" stroke={brass} strokeWidth={sw} />
        <circle cx="80" cy="18" r="4" fill="none" stroke={brass} strokeWidth={sw} />
      </Fragment>

      {/* the cauldron head, a mixture bowl with mismatched eyes */}
      <Fragment offset="translate(0px, -16px) rotate(0deg)" dismembered={dismembered}>
        <path d="M44 44 Q44 66 60 66 Q76 66 76 44 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M44 44 L76 44" stroke={clay} strokeWidth={sw} />
        <circle cx="54" cy="52" r="2" fill={plum} />
        <circle cx="66" cy="52" r="1.6" fill={brass} />
      </Fragment>

      {/* over-dispersed body — a lumpy, over-spread torso */}
      <Fragment offset="translate(-24px, 18px) rotate(-16deg)" dismembered={dismembered}>
        <path d="M42 66 Q36 78 40 92 Q44 108 60 110 Q76 108 80 92 Q84 78 78 66 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        {/* a histogram of counts engraved, one bar a zero-spike in plum */}
        <path d="M50 98 L50 88 M57 98 L57 80 M64 98 L64 86 M71 98 L71 92" stroke={bone} strokeWidth="1" />
        <path d="M43 98 L43 74" stroke={plum} strokeWidth="1.4" />
      </Fragment>

      {/* stubby mismatched legs */}
      <Fragment offset="translate(8px, 30px) rotate(14deg)" dismembered={dismembered}>
        <path d="M50 110 L48 134 L58 134 L58 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M64 110 L64 138 L74 138 L72 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function PhantomGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const plum = state === 'forged' ? 'var(--plum-500)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Phantom Golem, ${state}`}>
      {/* error bars for a crown — every measurement an interval, not a point */}
      <Fragment offset="translate(0px, -32px) rotate(0deg)" dismembered={dismembered}>
        <line x1="44" y1="22" x2="44" y2="38" stroke={brass} strokeWidth="1.2" />
        <line x1="40" y1="22" x2="48" y2="22" stroke={brass} strokeWidth="1.2" />
        <line x1="40" y1="38" x2="48" y2="38" stroke={brass} strokeWidth="1.2" />
        <line x1="76" y1="24" x2="76" y2="40" stroke={brass} strokeWidth="1.2" />
        <line x1="72" y1="24" x2="80" y2="24" stroke={brass} strokeWidth="1.2" />
        <line x1="72" y1="40" x2="80" y2="40" stroke={brass} strokeWidth="1.2" />
        <circle cx="44" cy="30" r="1.4" fill={brass} />
        <circle cx="76" cy="32" r="1.4" fill={brass} />
      </Fragment>

      {/* head, half-there */}
      <Fragment offset="translate(0px, -18px) rotate(0deg)" dismembered={dismembered}>
        <path d="M48 62 L48 46 Q48 40 54 40 L66 40 Q72 40 72 46 L72 62" fill={plum} opacity="0.08" stroke={plum} strokeWidth={sw} strokeDasharray="3 3" strokeLinejoin="round" />
        <circle cx="55" cy="51" r="1.8" fill={brass} />
        <circle cx="65" cy="51" r="1.8" fill={brass} />
      </Fragment>

      {/* torso with a hole where the data is missing */}
      <Fragment offset="translate(-22px, 16px) rotate(-14deg)" dismembered={dismembered}>
        <path d="M44 62 L76 62 Q80 62 80 68 L78 110 L42 110 L40 68 Q40 62 44 62 Z" fill={plum} opacity="0.06" stroke={clay} strokeWidth={sw} strokeDasharray="4 3" strokeLinejoin="round" />
        <circle cx="60" cy="86" r="7" fill="var(--ink-950)" stroke={plum} strokeWidth="1" strokeDasharray="2 2" />
        <path d="M53 74 L57 74 M64 96 L68 96" stroke={bone} strokeWidth="0.8" />
      </Fragment>

      {/* trailing wisp instead of legs — a ghost from imperfect measurement */}
      <Fragment offset="translate(8px, 30px) rotate(12deg)" dismembered={dismembered}>
        <path d="M46 110 Q44 126 52 132 Q60 138 60 126 Q60 138 68 132 Q76 126 74 110" fill={plum} opacity="0.06" stroke={clay} strokeWidth={sw} strokeDasharray="4 3" strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function MadScientistGolem({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const verd = state === 'forged' ? 'var(--verdigris-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Mad Scientist Golem, ${state}`}>
      {/* a predator–prey orbit haloing the head — a model that must be solved */}
      <Fragment offset="translate(0px, -30px) rotate(0deg)" dismembered={dismembered}>
        <ellipse cx="60" cy="30" rx="26" ry="12" fill="none" stroke={verd} strokeWidth="1" opacity="0.6" transform="rotate(-12 60 30)" />
        <circle cx="84" cy="26" r="2" fill={brass} />
        <circle cx="36" cy="34" r="1.6" fill={verd} />
      </Fragment>

      {/* wild-haired head */}
      <Fragment offset="translate(0px, -18px) rotate(0deg)" dismembered={dismembered}>
        <path d="M48 60 Q46 42 60 42 Q74 42 72 60 Z" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M48 48 L40 42 M52 44 L48 36 M60 42 L60 34 M68 44 L72 36 M72 48 L80 42" stroke={bone} strokeWidth="1" />
        <circle cx="55" cy="52" r="1.8" fill={brass} />
        <circle cx="65" cy="52" r="1.8" fill={brass} />
      </Fragment>

      {/* a cylinder torso — the geometric body of the height³ law */}
      <Fragment offset="translate(-22px, 16px) rotate(-12deg)" dismembered={dismembered}>
        <ellipse cx="60" cy="66" rx="16" ry="5" fill="none" stroke={clay} strokeWidth={sw} />
        <path d="M44 66 L44 106 Q44 110 60 110 Q76 110 76 106 L76 66" fill="none" stroke={clay} strokeWidth={sw} />
        <ellipse cx="60" cy="106" rx="16" ry="5" fill="none" stroke={clay} strokeWidth="1" />
        <path d="M50 78 Q60 82 70 78 M50 90 Q60 94 70 90" fill="none" stroke={bone} strokeWidth="0.8" />
        <path d="M55 70 L55 100 M65 70 L65 100" stroke={bone} strokeWidth="0.6" opacity="0.6" />
      </Fragment>

      {/* one arm brandishing a test tube */}
      <Fragment offset="translate(28px, 8px) rotate(30deg)" dismembered={dismembered}>
        <path d="M76 74 L88 60" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
        <rect x="85" y="50" width="6" height="12" rx="2" fill={verd} opacity="0.2" stroke={brass} strokeWidth="1" />
      </Fragment>
      <Fragment offset="translate(-28px, 8px) rotate(-30deg)" dismembered={dismembered}>
        <path d="M44 74 L32 66" stroke={clay} strokeWidth={sw} strokeLinecap="round" />
      </Fragment>

      {/* legs */}
      <Fragment offset="translate(6px, 30px) rotate(12deg)" dismembered={dismembered}>
        <path d="M50 110 L48 136 L58 136 L58 110 M63 110 L63 136 L73 136 L72 110" fill="none" stroke={clay} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>
    </svg>
  )
}

export function WorkshopMasterSeal({
  state = 'forged',
  dismembered = false,
  className,
}: GolemArtProps) {
  const clay = state === 'forged' ? 'var(--clay-500)' : 'var(--line)'
  const bone = state === 'forged' ? 'var(--bone-300)' : 'var(--line)'
  const brass = state === 'forged' ? 'var(--brass-400)' : 'var(--line)'
  const sw = 1.5

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Workshop Master Seal, ${state}`}>
      {/* outer engraved medallion ring */}
      <Fragment offset="translate(-24px, -20px) rotate(-40deg)" dismembered={dismembered}>
        <circle cx="60" cy="75" r="40" fill="none" stroke={brass} strokeWidth={sw} />
        <circle cx="60" cy="75" r="34" fill="none" stroke={bone} strokeWidth="0.8" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * Math.PI) / 12
          return <line key={i} x1={60 + 40 * Math.cos(a)} y1={75 + 40 * Math.sin(a)} x2={60 + 36 * Math.cos(a)} y2={75 + 36 * Math.sin(a)} stroke={brass} strokeWidth="0.8" />
        })}
      </Fragment>

      {/* radiant burst behind the key */}
      <Fragment offset="translate(24px, 20px) rotate(40deg)" dismembered={dismembered}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6
          return <line key={i} x1={60 + 12 * Math.cos(a)} y1={75 + 12 * Math.sin(a)} x2={60 + 28 * Math.cos(a)} y2={75 + 28 * Math.sin(a)} stroke={brass} strokeWidth="0.8" opacity="0.4" />
        })}
      </Fragment>

      {/* the workshop key at the centre */}
      <Fragment offset="translate(0px, -28px) rotate(0deg)" dismembered={dismembered}>
        <circle cx="60" cy="60" r="8" fill="none" stroke={brass} strokeWidth={sw} />
        <circle cx="60" cy="60" r="3" fill="var(--ink-950)" stroke={brass} strokeWidth="1" />
        <path d="M60 68 L60 92 L66 92 L66 86 L60 86 M60 92 L54 92 L54 88 L60 88" fill="none" stroke={brass} strokeWidth={sw} strokeLinejoin="round" />
      </Fragment>

      {/* a small forged golem head stamped below, the maker's mark */}
      <Fragment offset="translate(0px, 30px) rotate(0deg)" dismembered={dismembered}>
        <path d="M52 104 L52 98 Q52 94 56 94 L64 94 Q68 94 68 98 L68 104 Z" fill="none" stroke={clay} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="57" cy="100" r="1.2" fill={brass} />
        <circle cx="63" cy="100" r="1.2" fill={brass} />
      </Fragment>
    </svg>
  )
}

