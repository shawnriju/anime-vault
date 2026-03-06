import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./auth/AuthContext";
import Callback from "./auth/Callback";
import './index.css'
import App from './App.jsx'

// Detect callback by pathname OR by presence of code/error params
// This is more reliable than pathname alone across different hosting environments
const params   = new URLSearchParams(window.location.search);
const isCallback = 
  window.location.pathname.includes("callback") ||
  params.has("code") ||
  params.has("error");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {isCallback ? <Callback /> : <App />}
    </AuthProvider>
  </StrictMode>,
)
