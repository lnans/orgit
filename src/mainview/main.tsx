import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, Providers } from './App'
import './index.css'
import './lib/electrobun'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
)
