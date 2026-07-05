import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import type { ComponentType } from 'react'

import '@fontsource/gloock/400.css'
import '@fontsource/stix-two-text/400.css'
import '@fontsource/stix-two-text/400-italic.css'
import '@fontsource/stix-two-text/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'

import { Layout } from './components/core/Layout'
import { ChapterPage } from './pages/ChapterPage'
import { Home } from './pages/Home'
import { chapterBySlug } from './content/chapters'
import { chapterContent } from './content/chapter-content'

// Direct hit on a chapter page: start fetching its prose chunk and the MDX
// styling layer (KaTeX CSS rides with it) now, in parallel with React boot,
// instead of after the first render. import() dedupes, so the lazy routes
// reuse these requests.
{
  const path = window.location.pathname
  const slug = path.match(/\/chapter\/([^/]+)/)?.[1]
  const ch = slug ? chapterBySlug(slug) : undefined
  if (ch) {
    void chapterContent[ch.n]?.()
    void import('./components/core/mdx-components')
  }
  if (path.includes('/bestiary')) void import('./pages/Bestiary')
  if (path.includes('/review')) void import('./pages/Review')
}

/**
 * Everything but the shell, home, and chapter frame is lazy so the entry
 * chunk stays lean: /dev demos would drag every engine in, Bestiary pulls
 * the full golem art file, Review pulls the deck prose.
 */
const dev = (load: () => Promise<Record<string, unknown>>, name: string) => {
  const Page = lazy(async () => {
    const mod = await load()
    return { default: mod[name] as ComponentType }
  })
  return (
    <Suspense
      // Tall fallback: the swap to page content must not shift the footer
      // through the viewport (CLS).
      fallback={<p className="min-h-[85vh] px-6 py-24 text-sm">Lighting the lamps…</p>}
    >
      <Page />
    </Suspense>
  )
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/chapter/:slug', element: <ChapterPage /> },
        { path: '/bestiary', element: dev(() => import('./pages/Bestiary'), 'Bestiary') },
        { path: '/review', element: dev(() => import('./pages/Review'), 'Review') },
        { path: '/dev', element: dev(() => import('./pages/dev/DevIndex'), 'DevIndex') },
        { path: '/dev/specimen', element: dev(() => import('./pages/dev/Specimen'), 'Specimen') },
        { path: '/dev/living-posterior', element: dev(() => import('./pages/dev/LivingPosteriorDemo'), 'LivingPosteriorDemo') },
        { path: '/dev/garden', element: dev(() => import('./pages/dev/GardenDemo'), 'GardenDemo') },
        { path: '/dev/calibration', element: dev(() => import('./pages/dev/CalibrationDemo'), 'CalibrationDemo') },
        { path: '/dev/webr', element: dev(() => import('./pages/dev/WebRDemo'), 'WebRDemo') },
        { path: '/dev/ceremony', element: dev(() => import('./pages/dev/CeremonyDemo'), 'CeremonyDemo') },
        { path: '/dev/dag', element: dev(() => import('./pages/dev/DagDemo'), 'DagDemo') },
        { path: '/dev/prior', element: dev(() => import('./pages/dev/PriorDemo'), 'PriorDemo') },
        { path: '/dev/explorer', element: dev(() => import('./pages/dev/ExplorerDemo'), 'ExplorerDemo') },
        { path: '/dev/overfit', element: dev(() => import('./pages/dev/OverfitDemo'), 'OverfitDemo') },
        { path: '/dev/interaction', element: dev(() => import('./pages/dev/InteractionDemo'), 'InteractionDemo') },
        { path: '/dev/hmc', element: dev(() => import('./pages/dev/HmcDemo'), 'HmcDemo') },
        { path: '/dev/triage', element: dev(() => import('./pages/dev/TriageDemo'), 'TriageDemo') },
        { path: '/dev/entropy', element: dev(() => import('./pages/dev/EntropyDemo'), 'EntropyDemo') },
        { path: '/dev/link', element: dev(() => import('./pages/dev/LinkDemo'), 'LinkDemo') },
        { path: '/dev/chimps', element: dev(() => import('./pages/dev/ChimpDemo'), 'ChimpDemo') },
        { path: '/dev/admit', element: dev(() => import('./pages/dev/AdmitDemo'), 'AdmitDemo') },
        { path: '/dev/kline', element: dev(() => import('./pages/dev/KlineDemo'), 'KlineDemo') },
        { path: '/dev/cutpoints', element: dev(() => import('./pages/dev/CutpointDemo'), 'CutpointDemo') },
        { path: '/dev/zip', element: dev(() => import('./pages/dev/ZipDemo'), 'ZipDemo') },
        { path: '/dev/shrinkage', element: dev(() => import('./pages/dev/ShrinkageDemo'), 'ShrinkageDemo') },
        { path: '/dev/divergence', element: dev(() => import('./pages/dev/DivergenceDemo'), 'DivergenceDemo') },
        { path: '/dev/cafe', element: dev(() => import('./pages/dev/CafeDemo'), 'CafeDemo') },
        { path: '/dev/gp', element: dev(() => import('./pages/dev/GpDemo'), 'GpDemo') },
        { path: '/dev/error', element: dev(() => import('./pages/dev/ErrorDemo'), 'ErrorDemo') },
        { path: '/dev/imputation', element: dev(() => import('./pages/dev/ImputationDemo'), 'ImputationDemo') },
        { path: '/dev/geometric', element: dev(() => import('./pages/dev/GeometricDemo'), 'GeometricDemo') },
        { path: '/dev/lynxhare', element: dev(() => import('./pages/dev/LynxHareDemo'), 'LynxHareDemo') },
        { path: '/dev/horoscopes', element: dev(() => import('./pages/dev/HoroscopesDemo'), 'HoroscopesDemo') },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
