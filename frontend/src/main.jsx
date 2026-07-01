import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'  // ← ADD THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>  {/* ← ADD THIS */}
      <App />
    </LanguageProvider>  {/* ← ADD THIS */}
  </React.StrictMode>,
)
