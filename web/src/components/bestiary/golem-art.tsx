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

