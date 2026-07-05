import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import '@fontsource/gloock/400.css'
import '@fontsource/stix-two-text/400.css'
import '@fontsource/stix-two-text/400-italic.css'
import '@fontsource/stix-two-text/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'

import { Layout } from './components/core/Layout'
import { Bestiary } from './pages/Bestiary'
import { ChapterPage } from './pages/ChapterPage'
import { Home } from './pages/Home'
import { AdmitDemo } from './pages/dev/AdmitDemo'
import { CalibrationDemo } from './pages/dev/CalibrationDemo'
import { ChimpDemo } from './pages/dev/ChimpDemo'
import { CutpointDemo } from './pages/dev/CutpointDemo'
import { EntropyDemo } from './pages/dev/EntropyDemo'
import { KlineDemo } from './pages/dev/KlineDemo'
import { LinkDemo } from './pages/dev/LinkDemo'
import { ZipDemo } from './pages/dev/ZipDemo'
import { ShrinkageDemo } from './pages/dev/ShrinkageDemo'
import { DivergenceDemo } from './pages/dev/DivergenceDemo'
import { CafeDemo } from './pages/dev/CafeDemo'
import { GpDemo } from './pages/dev/GpDemo'
import { CeremonyDemo } from './pages/dev/CeremonyDemo'
import { DagDemo } from './pages/dev/DagDemo'
import { DevIndex } from './pages/dev/DevIndex'
import { ExplorerDemo } from './pages/dev/ExplorerDemo'
import { HmcDemo } from './pages/dev/HmcDemo'
import { InteractionDemo } from './pages/dev/InteractionDemo'
import { OverfitDemo } from './pages/dev/OverfitDemo'
import { PriorDemo } from './pages/dev/PriorDemo'
import { GardenDemo } from './pages/dev/GardenDemo'
import { TriageDemo } from './pages/dev/TriageDemo'
import { LivingPosteriorDemo } from './pages/dev/LivingPosteriorDemo'
import { Specimen } from './pages/dev/Specimen'
import { WebRDemo } from './pages/dev/WebRDemo'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/chapter/:slug', element: <ChapterPage /> },
        { path: '/bestiary', element: <Bestiary /> },
        { path: '/dev', element: <DevIndex /> },
        { path: '/dev/specimen', element: <Specimen /> },
        { path: '/dev/living-posterior', element: <LivingPosteriorDemo /> },
        { path: '/dev/garden', element: <GardenDemo /> },
        { path: '/dev/calibration', element: <CalibrationDemo /> },
        { path: '/dev/webr', element: <WebRDemo /> },
        { path: '/dev/ceremony', element: <CeremonyDemo /> },
        { path: '/dev/dag', element: <DagDemo /> },
        { path: '/dev/prior', element: <PriorDemo /> },
        { path: '/dev/explorer', element: <ExplorerDemo /> },
        { path: '/dev/overfit', element: <OverfitDemo /> },
        { path: '/dev/interaction', element: <InteractionDemo /> },
        { path: '/dev/hmc', element: <HmcDemo /> },
        { path: '/dev/triage', element: <TriageDemo /> },
        { path: '/dev/entropy', element: <EntropyDemo /> },
        { path: '/dev/link', element: <LinkDemo /> },
        { path: '/dev/chimps', element: <ChimpDemo /> },
        { path: '/dev/admit', element: <AdmitDemo /> },
        { path: '/dev/kline', element: <KlineDemo /> },
        { path: '/dev/cutpoints', element: <CutpointDemo /> },
        { path: '/dev/zip', element: <ZipDemo /> },
        { path: '/dev/shrinkage', element: <ShrinkageDemo /> },
        { path: '/dev/divergence', element: <DivergenceDemo /> },
        { path: '/dev/cafe', element: <CafeDemo /> },
        { path: '/dev/gp', element: <GpDemo /> },
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
