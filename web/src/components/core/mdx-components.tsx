/**
 * House styles for MDX chapter prose, plus the interactives exposed to
 * content authors. Loaded lazily with the chapter chunks (KaTeX CSS
 * rides along). The interactives themselves load one step later again —
 * prose is the LCP and must never wait on engine code, so every embed is
 * a lazy component behind a placeholder that holds its place on the bench.
 */
import 'katex/dist/katex.min.css'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Rosetta } from '../code/Rosetta'
import { WebRRunner } from '../code/WebRRunner'
import { LectureCallout } from './LectureCallout'

type EmbedsModule = typeof import('../../content/chapters/embeds')
type GardenModule =
  typeof import('../interactives/garden-of-forking-data/GardenOfForkingData')

function placeholder() {
  return (
    <div
      className="mt-8 rounded-card border border-line px-4 py-12 text-center text-sm text-secondary"
      aria-busy="true"
    >
      Warming the instrument…
    </div>
  )
}

type EmbedProps = Record<string, unknown>

/**
 * Mounts children only once the reader nears them (600px ahead). Chapter
 * interactives can fit models on mount — the ch4 explorer's quap fit costs
 * ~700ms of main thread — and none of that belongs in page load.
 */
function OnApproach({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px' },
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return near ? <>{children}</> : <div ref={ref}>{placeholder()}</div>
}

function embed(name: keyof EmbedsModule) {
  const Inner = lazy(async () => {
    const m = await import('../../content/chapters/embeds')
    return { default: m[name] as ComponentType<EmbedProps> }
  })
  return function Embed(props: EmbedProps) {
    return (
      <OnApproach>
        <Suspense fallback={placeholder()}>
          <Inner {...props} />
        </Suspense>
      </OnApproach>
    )
  }
}

const LazyGarden = lazy(async () => {
  const m: GardenModule = await import(
    '../interactives/garden-of-forking-data/GardenOfForkingData'
  )
  return { default: m.GardenOfForkingData as ComponentType<EmbedProps> }
})
function GardenOfForkingData(props: EmbedProps) {
  return (
    <OnApproach>
      <Suspense fallback={placeholder()}>
        <LazyGarden {...props} />
      </Suspense>
    </OnApproach>
  )
}

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="eyebrow mt-16 border-b border-line pb-3 !text-base" {...props} />
  ),
  h3: (props) => <h3 className="mt-10 font-display text-lg" {...props} />,
  p: (props) => <p className="mt-5 leading-[1.65]" {...props} />,
  ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="mt-5 list-decimal space-y-2 pl-6" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-5 border-l border-accent pl-5 text-secondary" {...props} />
  ),
  code: (props) => <code className="text-[0.92em]" {...props} />,
  pre: (props) => (
    <pre
      className="mt-5 overflow-x-auto rounded-card border border-line bg-ink-950 p-4 text-sm leading-relaxed"
      {...props}
    />
  ),
  hr: () => <hr className="mt-16" />,
  em: (props) => <em {...props} />,
  // gloss line under display equations. A block <span> rather than <p>:
  // remark-math wraps the display equation in a paragraph and the Gloss
  // that follows can land inside it, where a <p> would be invalid nesting.
  Gloss: ({ children }: { children: React.ReactNode }) => (
    <span className="mt-2 block text-sm text-secondary italic">{children}</span>
  ),
  Wide: ({ children }: { children: React.ReactNode }) => (
    <div className="mt-8 lg:-mx-24">{children}</div>
  ),
  LectureCallout,
  GardenOfForkingData,
  GlobeCalibration: embed('GlobeCalibration'),
  PriorPlayground: embed('PriorPlayground'),
  DagSandbox: embed('DagSandbox'),
  HowellExplorer: embed('HowellExplorer'),
  OverfitGame: embed('OverfitGame'),
  RuggedSurface: embed('RuggedSurface'),
  TulipsSurface: embed('TulipsSurface'),
  HmcToy: embed('HmcToy'),
  TraceTriage: embed('TraceTriage'),
  EntropyPebbles: embed('EntropyPebbles'),
  LinkMorpher: embed('LinkMorpher'),
  ChimpExplorer: embed('ChimpExplorer'),
  AdmitParadox: embed('AdmitParadox'),
  KlinePoisson: embed('KlinePoisson'),
  CutpointDragger: embed('CutpointDragger'),
  ZeroInflationMixer: embed('ZeroInflationMixer'),
  ReedfrogTheater: embed('ReedfrogTheater'),
  DivergenceDetective: embed('DivergenceDetective'),
  CafeEllipse: embed('CafeEllipse'),
  GpIslands: embed('GpIslands'),
  DivorceError: embed('DivorceError'),
  MilkImputation: embed('MilkImputation'),
  GeometricPeople: embed('GeometricPeople'),
  LynxHareOde: embed('LynxHareOde'),
  HoroscopesCapstone: embed('HoroscopesCapstone'),
  Rosetta,
  WebRRunner,
}
