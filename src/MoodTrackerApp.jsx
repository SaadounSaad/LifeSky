import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'swiper/css';
import 'swiper/css/navigation';
import StarRating from "./StarRating.jsx";  // 📌 Ajoute bien `.jsx`
import './App.css';

// Initialisation de Supabase
// Importation des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Importation des icônes
const SleepIcon = "/icons/sleep.png";
const StressIcon = "/icons/stress.png";
const ActivityIcon = "/icons/activity.png";
const EnergyIcon = "/icons/energy.png";
const SpiritualityIcon = "/icons/spirituality.png";
const CGMIcon = "/icons/cgm.png";


// Définition des émotions
const iconsPath = '/icons/';
const emotions = [
  { name: 'Bonheur', file: 'Mood_Bonheur.png' },
  { name: 'Enthousiasme', file: 'Mood_Excitation.png' },
  { name: 'Satisfaction', file: 'Mood_Satisfaction.png' },
  { name: 'Surprise', file: 'Mood_Surprise.png' },
  { name: 'Ennui', file: 'Mood_Ennui.png' },
  { name: 'Anxiété', file: 'Mood_Anxiete.png' },
  { name: 'Peur', file: 'Mood_Peur.png' },
  { name: 'Dégoût', file: 'Mood_Degout.png' },
  { name: 'Tristesse', file: 'Mood_Tristesse.png' },
  { name: 'Colère', file: 'Mood_Colere.png' }
];

const MoodTrackerApp = () => {
  const [entries, setEntries] = useState([]);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(null);
  const [sleep, setSleep] = useState(1);
  const [stress, setStress] = useState(1);
  const [activity, setActivity] = useState(1);
  const [energy, setEnergy] = useState(1);
  const [spirituality, setSpirituality] = useState(1);
  const [cgm, setCGM] = useState(1);
  const [definition, setDefinition] = useState('Cliquez sur une émotion pour voir sa définition');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState("");
  // ✅ Fonction qui remet le zoom à la normale après saisie
  const resetZoom = () => {
    document.activeElement.blur(); // ✅ Désélectionner le champ de saisie
    setTimeout(() => {
      document.body.style.zoom = "100%"; // ✅ Forcer le retour au zoom normal
      window.scrollTo(0, 0); // ✅ Remonter en haut de la page
    }, 100);
  };
  
  useEffect(() => {
    // ✅ 1. Charger les entrées depuis `localStorage` (NE PAS SUPPRIMER SI HORS LIGNE)
    const savedEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    if (savedEntries.length > 0) {
      console.log("📂 Chargement des entrées depuis localStorage :", savedEntries);
      setEntries(savedEntries);
    }
  
    // ✅ 2. Charger les définitions des émotions depuis `localStorage`
    const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || [];
    if (savedDefinitions.length > 0) {
      console.log("📂 Chargement des définitions depuis localStorage :", savedDefinitions);
    }
  
    // ✅ 3. Si en ligne, synchroniser avec Supabase
    const fetchData = async () => {
      if (navigator.onLine) {
        console.log("🌐 Connexion détectée : Synchronisation avec Supabase...");
  
        // ✅ Récupérer les entrées
        const { data: entriesData, error: entriesError } = await supabase
          .from('mood_entries')
          .select('*')
          .order('date', { ascending: false });
  
        if (!entriesError) {
          console.log("📂 Entrées mises à jour depuis Supabase :", entriesData);
          setEntries(entriesData || []);
          localStorage.setItem("moodEntries", JSON.stringify(entriesData || []));
        } else {
          console.error("❌ Erreur récupération des entrées :", entriesError);
        }
  
        // ✅ Récupérer les définitions des émotions
        const { data: definitionsData, error: definitionsError } = await supabase
          .from('emotions')
          .select('emotion_fr, definition');
  
        if (!definitionsError) {
          console.log("📂 Définitions récupérées depuis Supabase :", definitionsData);
          localStorage.setItem("emotionDefinitions", JSON.stringify(definitionsData));
        } else {
          console.error("❌ Erreur récupération des définitions :", definitionsError);
        }
      }
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker enregistré !");
      });
    }
  }, []);
  
   

  const formatDate = (date) => {
    return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  const selectEmotion = (emotionName) => {
    console.log("Émotion sélectionnée :", emotionName);
    setMood(emotionName);  // Stocker "Bonheur", "Tristesse", etc.
  };
  const fetchEmotionDefinition = async (emotionName) => {
    setMood(emotionName);
    console.log("🔍 Recherche de la définition pour :", emotionName);

    // ✅ Vérifier si hors ligne et charger depuis `localStorage`
    if (!navigator.onLine) {
        console.log("⚠️ Hors ligne : Chargement depuis localStorage...");
        const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || [];

        const offlineDefinition = savedDefinitions.find(emotion => emotion.emotion_fr === emotionName);
        
        if (offlineDefinition) {
            setDefinition(offlineDefinition.definition);
            return;
        } else {
            setDefinition("Définition indisponible hors ligne.");
            return;
        }
    }

    // ✅ Si en ligne, récupérer depuis Supabase
    const { data, error } = await supabase
        .from('emotions')
        .select('definition')
        .eq('emotion_fr', emotionName)
        .single();

    if (error) {
        console.error('❌ Erreur récupération définition:', error);
        setDefinition("Définition non disponible.");
    } else {
        setDefinition(data?.definition || "Pas de définition disponible.");
    }
};

useEffect(() => {
  const syncWithSupabase = async () => {
    if (navigator.onLine) {
      console.log("🌐 Connexion rétablie : Synchronisation avec Supabase...");

      const savedEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];

      for (const entry of savedEntries) {
        const { error } = await supabase.from('mood_entries').insert([entry]);

        if (!error) {
          console.log("✅ Synchronisation réussie :", entry);
        } else {
          console.error("❌ Erreur de synchronisation :", error);
        }
      }

      // ✅ Nettoyage de `localStorage` après synchronisation
      localStorage.removeItem("moodEntries");
    }
  };

  window.addEventListener("online", syncWithSupabase);
  return () => window.removeEventListener("online", syncWithSupabase);
}, []);


const addEntry = async () => {
  if (!note.trim() || !mood) {
    alert("Veuillez entrer une note et sélectionner une émotion !");
    return;
  }

  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const newEntry = {
    mood,
    note,
    sleep,
    stress,
    activity,
    energy,
    spirituality,
    cgm,
    date: formattedDate,
    heure: formattedTime
  };

  if (navigator.onLine) {
    console.log("🌐 En ligne : Tentative d'ajout à Supabase...");
    
    const { error } = await supabase.from('mood_entries').insert([newEntry]);

    if (error) {
      console.error("❌ Erreur d’ajout à Supabase :", error);
    } else {
      console.log("✅ Enregistrement réussi sur Supabase !");
    }
  } else {
    console.log("⚠️ Hors ligne : Sauvegarde locale temporaire...");
    
    // ✅ Récupérer les entrées locales et ajouter la nouvelle entrée
    const savedEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    savedEntries.unshift(newEntry);
    
    // ✅ Sauvegarde en `localStorage` sans écraser les données existantes
    localStorage.setItem("moodEntries", JSON.stringify(savedEntries));

    // ✅ Afficher les entrées locales même hors ligne
    setEntries(savedEntries);
  }

  // ✅ Mise à jour de l'affichage
  setMood(null);
  setSleep(1);
  setStress(1);
  setActivity(1);
  setEnergy(1);
  setSpirituality(1);
  setCGM(1);
  setNote("");
  
  setSuccessMessage("✅ Entrée enregistrée !");
  setTimeout(() => setSuccessMessage(""), 3000);
  resetZoom();  // ✅ Corrige le zoom après validation
};


  return (
    <div className="container">
      <h1 className="text-2xl font-bold text-blue-900">MoodSky   </h1>
      <h1 className="text-2xl font-bold text-blue-900">يوميات مناخك الداخلي</h1>
      <p className="time-display">{formatDate(currentTime)}</p>
        {/* ✅ Ajout du message ici */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="container">
      
      {/* 🌟 Nouvelle section étoiles */}
      <div className="star-sliders">
        {[
          { icon: SpiritualityIcon, label: "Spiritualité", state: spirituality, setter: setSpirituality },
          { icon: CGMIcon, label: "CGM", state: cgm, setter: setCGM },
          { icon: SleepIcon, label: "Sommeil", state: sleep, setter: setSleep },
          { icon: StressIcon, label: "Stress", state: stress, setter: setStress },
          { icon: ActivityIcon, label: "Activité", state: activity, setter: setActivity },
          { icon: EnergyIcon, label: "Énergie", state: energy, setter: setEnergy }
        ].map((item, index) => (
          <div key={index} className="star-item">
            {/* 🔹 Nouvelle disposition pour aligner l’icône et le texte */}
            <div className="icon-label">
              <img src={item.icon} alt={item.label} className="rating-icon" />
              <p>{item.label}</p>
            </div>
            <StarRating value={item.state} onChange={item.setter} />
          </div>
        ))}
      </div>


    </div>
  
    <div className="emotion-selection">
      {emotions.map((emotion) => (
        <div key={emotion.name} className="emotion-item">
          <img
            src={`${iconsPath}${emotion.file}`}
            alt={emotion.name}
            className={mood === emotion.name ? 'selected' : ''}
            onClick={() => fetchEmotionDefinition(emotion.name)}
          />
          <p className="emotion-label">{emotion.name}</p>  {/* ✅ Ajout du label sous l’image */}
        </div>
      ))}
    </div>

      <p className="emotion-definition">{definition}</p>

      <textarea className="comment-box" placeholder="كيف كان يومك ؟" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="save-button" onClick={addEntry}>Enregistrer</button>
      <button className="clear-button-small" onClick={() => {
        localStorage.removeItem("moodEntries");
        setEntries([]);
        console.log("🗑️ Données locales supprimées.");
      }}>
        🗑️
      </button>
    </div>
  );
};

export default MoodTrackerApp;

