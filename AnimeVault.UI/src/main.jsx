import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./auth/AuthContext";
import Callback from "./auth/Callback";
import './index.css'
import App from './App.jsx'

const isCallback = window.location.pathname === "/callback";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {isCallback ? <Callback /> : <App />}
    </AuthProvider>
  </StrictMode>,
)
