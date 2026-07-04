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
