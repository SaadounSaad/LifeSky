import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log("✅ Service Worker enregistré avec succès :", registration);
      })
      .catch((error) => {
        console.error("❌ Échec de l'enregistrement du Service Worker :", error);
      });
  });
}
