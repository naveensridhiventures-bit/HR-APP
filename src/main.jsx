import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Clear old service worker caches that cause repeated API calls
if ('serviceWorker' in navigator) {
  // Remove old sridhi-api-cache (NetworkFirst that caused 6 repeated calls)
  caches.keys().then(keys => {
    keys.forEach(key => {
      if (key.includes('sridhi-api-cache') && !key.includes('v2')) {
        caches.delete(key)
      }
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
