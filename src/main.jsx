import React from 'react'
import ReactDOM from 'react-dom/client'
import IPOAnalyzer from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <IPOAnalyzer />
    </ThemeProvider>
  </React.StrictMode>,
)
