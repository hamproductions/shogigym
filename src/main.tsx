import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.tsx'
import { engineSupported, getEngine } from './engine'

if (engineSupported()) getEngine().catch((error) => console.warn('engine preload failed', error))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
