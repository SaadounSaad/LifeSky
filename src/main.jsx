import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/serviceWorker.js")
      .then((registration) => console.log("✅ Service Worker enregistré :", registration))
      .catch((error) => console.error("❌ Échec de l'enregistrement du Service Worker :", error));
  });
}
const saveEntryLocally = (entry) => {
  let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  localEntries.unshift(entry);
  localStorage.setItem("moodEntries", JSON.stringify(localEntries));
  console.log("💾 Entrée sauvegardée localement :", entry);
};

// ✅ Ajoute cette fonction pour synchroniser les entrées dès que l'app repasse en ligne
const syncEntries = async () => {
  if (!navigator.onLine) return;

  let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  if (localEntries.length === 0) return;

  try {
    console.log(`🔄 Synchronisation de ${localEntries.length} entrées locales...`);
    const { error } = await supabase.from("mood_entries").insert(localEntries);
    if (error) throw error;

    console.log("✅ Synchronisation réussie !");
    localStorage.removeItem("moodEntries"); // Supprime les entrées une fois synchronisées
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation :", error);
  }
};

// 🛠️ Déclencher la synchronisation quand l'app repasse en ligne
window.addEventListener("online", syncEntries);
