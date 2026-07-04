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
import { ChapterPage } from './pages/ChapterPage'
import { Home } from './pages/Home'
import { DevIndex } from './pages/dev/DevIndex'
import { Specimen } from './pages/dev/Specimen'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/chapter/:slug', element: <ChapterPage /> },
        { path: '/dev', element: <DevIndex /> },
        { path: '/dev/specimen', element: <Specimen /> },
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
