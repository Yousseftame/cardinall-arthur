import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* Self-hosted brand fonts — stable even when Google/Fontshare CDNs fail */
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/bodoni-moda/400.css'
import '@fontsource/bodoni-moda/500.css'
import '@fontsource/bodoni-moda/400-italic.css'
import '@fontsource/bodoni-moda/500-italic.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/500.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
