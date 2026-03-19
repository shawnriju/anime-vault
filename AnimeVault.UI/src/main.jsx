import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./auth/AuthContext";
import Callback from "./auth/Callback";
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Detect callback by pathname OR by presence of code/error params
const params   = new URLSearchParams(window.location.search);
const isCallback = 
  window.location.pathname.includes("callback") ||
  params.has("code") ||
  params.has("error");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isCallback ? <Callback /> : <App />}
      </AuthProvider>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181f',
            color: '#f0eff4',
            border: '1px solid #1e1e28',
          },
        }} 
      />
    </QueryClientProvider>
  </StrictMode>,
)
