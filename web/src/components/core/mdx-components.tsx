/**
 * House styles for MDX chapter prose, plus the interactives exposed to
 * content authors. Loaded lazily with the chapter chunks (KaTeX CSS
 * rides along).
 */
import 'katex/dist/katex.min.css'
import type { MDXComponents } from 'mdx/types'
import { Rosetta } from '../code/Rosetta'
import { WebRRunner } from '../code/WebRRunner'
import { GardenOfForkingData } from '../interactives/garden-of-forking-data/GardenOfForkingData'
import {
  AdmitParadox,
  CafeEllipse,
  ChimpExplorer,
  CutpointDragger,
  DagSandbox,
  DivergenceDetective,
  DivorceError,
  EntropyPebbles,
  GeometricPeople,
  GlobeCalibration,
  GpIslands,
  HmcToy,
  HoroscopesCapstone,
  HowellExplorer,
  KlinePoisson,
  LinkMorpher,
  LynxHareOde,
  MilkImputation,
  OverfitGame,
  PriorPlayground,
  ReedfrogTheater,
  RuggedSurface,
  TraceTriage,
  TulipsSurface,
  ZeroInflationMixer,
} from '../../content/chapters/embeds'
import { LectureCallout } from './LectureCallout'

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
  GlobeCalibration,
  PriorPlayground,
  DagSandbox,
  HowellExplorer,
  OverfitGame,
  RuggedSurface,
  TulipsSurface,
  HmcToy,
  TraceTriage,
  EntropyPebbles,
  LinkMorpher,
  ChimpExplorer,
  AdmitParadox,
  KlinePoisson,
  CutpointDragger,
  ZeroInflationMixer,
  ReedfrogTheater,
  DivergenceDetective,
  CafeEllipse,
  GpIslands,
  DivorceError,
  MilkImputation,
  GeometricPeople,
  LynxHareOde,
  HoroscopesCapstone,
  Rosetta,
  WebRRunner,
}
