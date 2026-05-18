import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Root } from './App'
import './index.css'
import './rpc'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
