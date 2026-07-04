/**
 * House styles for MDX chapter prose, plus the interactives exposed to
 * content authors. Loaded lazily with the chapter chunks (KaTeX CSS
 * rides along).
 */
import 'katex/dist/katex.min.css'
import type { MDXComponents } from 'mdx/types'
import { WebRRunner } from '../code/WebRRunner'
import { GardenOfForkingData } from '../interactives/garden-of-forking-data/GardenOfForkingData'
import { GlobeCalibration } from '../../content/chapters/embeds'
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
  // gloss line under display equations
  Gloss: ({ children }: { children: React.ReactNode }) => (
    <p className="mt-2 text-sm text-secondary italic">{children}</p>
  ),
  Wide: ({ children }: { children: React.ReactNode }) => (
    <div className="mt-8 lg:-mx-24">{children}</div>
  ),
  LectureCallout,
  GardenOfForkingData,
  GlobeCalibration,
  WebRRunner,
}
