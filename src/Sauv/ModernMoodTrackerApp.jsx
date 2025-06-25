// ---- الجزء 1: التعريفات والحالات الأساسية
import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaChartBar, FaPrayingHands, FaHeartbeat, FaHistory, FaCog, FaCloudUploadAlt, FaMoon, FaSun, FaSyncAlt, FaCalendarAlt, FaEdit, FaPlus } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LifeSkyApp = () => {
  // Navigation et UI
  const [activeTab, setActiveTab] = useState('spiritual'); // Défaut: onglet spirituel
  const [activeSubTab, setActiveSubTab] = useState('input'); // Sous-onglet: saisie
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  
  // États pour la gestion des dates
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  
  // États pour l'historique
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'spiritual', 'physical'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Données utilisateur
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  
  // États de connexion
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isSyncingRef = useRef(false);
  
  // États des émotions
  const [definition, setDefinition] = useState('اختر عاطفة لترى تعريفها');
  const [emotionDefinitions, setEmotionDefinitions] = useState({});

  // ---- الجزء 2: حالات الفئات للجانب الروحي والنفسي/الجسدي// ----

  // ---- ÉTATS DES CATÉGORIES SPIRITUELLES ----
  // Groupe 1: Fardh et Sunna
  const [fajr, setFajr] = useState(0);
  const [masjid, setMasjid] = useState(0);
  const [sunane, setSunane] = useState(0);
  const [witr, setWitr] = useState(0);
  
  // Groupe 2: Nawafil
  const [doha, setDoha] = useState(0);
  const [qiyam, setQiyam] = useState(0);
  const [coran, setCoran] = useState(0);
  const [don, setDon] = useState(0);
  
  // Groupe 3: Adhkar
  const [athkar, setAthkar] = useState(0);
  const [sabah, setSabah] = useState(0);
  const [masae, setMasae] = useState(0);
  
  // Groupe 4: Croissance spirituelle
  const [meditation, setMeditation] = useState(0);
  const [lecture, setLecture] = useState(0);
  const [gratitude, setGratitude] = useState(0);
  const [community, setCommunity] = useState(0);
  
  // ---- ÉTATS DES CATÉGORIES PHYSIQUES/MENTALES ----
  const [sport, setSport] = useState(0);
  const [divertir, setDivertir] = useState(0);
  const [stress, setStress] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [cgm, setCgm] = useState(0);
  const [rahim, setRahim] = useState(0);
  const [productivity, setProductivity] = useState(0);
  const [creativity, setCreativity] = useState(0);
  const [nutrition, setNutrition] = useState(0);
  const [water, setWater] = useState(0);

  
  // Configuration des catégories spirituelles
  const spiritualCategories = [
    // Groupe 1: Fardh et Sunna
    { 
      group: "الفرائض والسنن",
      items: [
        { icon: "/icons/Fajr.png", label: "ركعتا الفجر", state: fajr, setter: setFajr },
        { icon: "/icons/Masjid.png", label: "المسجد", state: masjid, setter: setMasjid },
        { icon: "/icons/Sunane.png", label: "السنن الرواتب", state: sunane, setter: setSunane },
        { icon: "/icons/witr.png", label: "صلاة الوتر", state: witr, setter: setWitr }
      ]
    },
    // Groupe 2: Nawafil
    {
      group: "العبادات النافلة",
      items: [
        { icon: "/icons/Doha.png", label: "ركعتا الضحى", state: doha, setter: setDoha },
        { icon: "/icons/Qiyam.png", label: "قيام الليل", state: qiyam, setter: setQiyam },
        { icon: "/icons/Coran.png", label: "الورد القرآني", state: coran, setter: setCoran },
        { icon: "/icons/Don.png", label: "أعمال مأجورة", state: don, setter: setDon }
      ]
    },
    // Groupe 3: Adhkar
    {
      group: "الأذكار",
      items: [
        { icon: "/icons/Athkar.png", label: "ورد الأذكار", state: athkar, setter: setAthkar },
        { icon: "/icons/Athkar.png", label: "أذكار الصباح", state: sabah, setter: setSabah },
        { icon: "/icons/Athkar.png", label: "أذكار المساء", state: masae, setter: setMasae }
      ]
    },
    // Groupe 4: Croissance spirituelle
    {
      group: "النمو الروحي",
      items: [
        { icon: "/icons/Qiyam.png", label: "التأمل الروحي", state: meditation, setter: setMeditation },
        { icon: "/icons/lecture.png", label: "القراءة العامة", state: lecture, setter: setLecture },
        { icon: "/icons/Don.png", label: "الشكر والامتنان", state: gratitude, setter: setGratitude },
        { icon: "/icons/social.png", label: "المجتمع الروحي", state: community, setter: setCommunity }
      ]
    }
  ];

  // Configuration des catégories physiques/mentales
  const physicalMentalCategories = [
    // Groupe 1: Santé physique
    {
      group: "الصحة البدنية",
      items: [
        { icon: "/icons/sport.png", label: "الرياضة", state: sport, setter: setSport },
        { icon: "/icons/sleep.png", label: "النوم", state: sleep, setter: setSleep },
        { icon: "/icons/cgm.png", label: "التغذية", state: nutrition, setter: setNutrition },
        { icon: "/icons/cgm.png", label: "شرب الماء", state: water, setter: setWater }
      ]
    },
    // Groupe 2: Santé mentale
    {
      group: "الصحة النفسية",
      items: [
        { icon: "/icons/stress.png", label: "التوتر", state: stress, setter: setStress },
        { icon: "/icons/divertis.png", label: "الترويح", state: divertir, setter: setDivertir },
        { icon: "/icons/lecture.png", label: "الإنتاجية", state: productivity, setter: setProductivity },
        { icon: "/icons/lecture.png", label: "الإبداع", state: creativity, setter: setCreativity }
      ]
    },
    // Groupe 3: Relations
    {
      group: "العلاقات الاجتماعية",
      items: [
        { icon: "/icons/social.png", label: "صلة الرحم", state: rahim, setter: setRahim }
      ]
    }
  ];

  // Configuration des émotions
  const emotions = [
    { name: 'الملل', file: 'Mood_Ennui.png' },
    { name: 'المفاجأة', file: 'Mood_Surprise.png' },
    { name: 'الرضا', file: 'Mood_Satisfaction.png' },
    { name: 'الحماس', file: 'Mood_Excitation.png' },
    { name: 'السعادة', file: 'Mood_Bonheur.png' },
    { name: 'الغضب', file: 'Mood_Colere.png' },
    { name: 'الحزن', file: 'Mood_Tristesse.png' },
    { name: 'الاشمئزاز', file: 'Mood_Degout.png' },
    { name: 'الخوف', file: 'Mood_Peur.png' },
    { name: 'القلق', file: 'Mood_Anxiete.png' }
  ];
  // Fonction pour charger les données d'une date spécifique
  // Modification de la fonction loadEntryForDate pour préserver l'émotion sélectionnée

// Le problème vient probablement de la fonction loadEntryForDate qui est appelée
// lorsque activeTab change, et qui réinitialise toutes les valeurs y compris la note.

// Modifions loadEntryForDate pour préserver la note et l'émotion quand on change d'onglet
  const loadEntryForDate = async (date) => {
    setLoadingEntry(true);
    
    console.log(`Chargement des données pour la date: ${date}`);
    
    if (isOnline) {
      try {
        // Debugging: Log complet de la requête
        console.log(`Requête exacte: SELECT * FROM mood_entries WHERE date = '${date}'`);
        
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('date', date);
        
        // Vérifions exactement ce que nous recevons 
        console.log("Résultat brut de la requête:", data, error);
        
        if (error) {
          console.error('Erreur lors du chargement:', error);
          loadFromLocalStorage(date);
        } else if (data && data.length > 0) {
          // Important: Prenons toujours la première entrée si plusieurs existent
          console.log('Données trouvées dans Supabase:', data[0]);
          populateFormWithData(data[0]);
          setIsEditMode(true);
        } else {
          console.log(`Aucune entrée trouvée pour ${date}`);
          resetFields();
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche Supabase:', error);
        loadFromLocalStorage(date);
      }
    } else {
      // Mode hors ligne - chercher dans localStorage
      loadFromLocalStorage(date);
    }
    
    setLoadingEntry(false);
  };

// Fonction modifiée pour charger depuis localStorage en préservant la note et l'émotion

// Fonction modifiée pour charger depuis localStorage sans filtrer par entrytype
const loadFromLocalStorage = (date) => {
  const localEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
  const entry = localEntries.find(e => e.date === date);
  
  if (entry) {
    console.log('Entrée trouvée dans localStorage:', entry);
    populateFormWithData(entry);
    setIsEditMode(true);
  } else {
    console.log(`Aucune entrée locale pour ${date}`);
    setIsEditMode(false);
    resetFields(); // Tout réinitialiser pour une nouvelle entrée
  }
};

// Nouvelle fonction pour remplir le formulaire en préservant la note et l'émotion
const populateFormWithDataPreservingCommon = (data, currentNote, currentMood, currentDefinition) => {
  // Si nous sommes en train de changer d'onglet mais pour la même date,
  // préservons la note et l'émotion actuelles si elles existent
  const isChangingTab = currentNote || currentMood;
  
  // Note: si nous sommes en train de changer d'onglet, on garde la note actuelle
  // sinon, on prend celle des données
  setNote(isChangingTab ? currentNote : (data.note || ''));
  
  // Pareil pour l'émotion
  if (isChangingTab) {
    setMood(currentMood);
    setDefinition(currentDefinition);
  } else if (data.mood) {
    setMood(data.mood);
    // Chercher la définition de l'émotion si possible
    const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
    const savedDefinition = savedDefinitions[data.mood];
    if (savedDefinition) {
      setDefinition(savedDefinition);
    } else {
      setDefinition("اختر عاطفة لترى تعريفها");
    }
  }
  
  // Catégories spirituelles
  setFajr(data.fajr || 0);
  setMasjid(data.masjid || 0);
  setSunane(data.sunane || 0);
  setWitr(data.witr || 0);
  setDoha(data.doha || 0);
  setQiyam(data.qiyam || 0);
  setCoran(data.coran || 0);
  setDon(data.don || 0);
  setAthkar(data.athkar || 0);
  setSabah(data.sabah || 0);
  setMasae(data.masae || 0);
  setMeditation(data.meditation || 0);
  setLecture(data.lecture || 0);
  setGratitude(data.gratitude || 0);
  setCommunity(data.community || 0);
  
  // Catégories physiques/mentales
  setSport(data.sport || 0);
  setDivertir(data.divertir || 0);
  setStress(data.stress || 0);
  setSleep(data.sleep || 0);
  setCgm(data.cgm || 0);
  setRahim(data.rahim || 0);
  setProductivity(data.productivity || 0);
  setCreativity(data.creativity || 0);
  setNutrition(data.nutrition || 0);
  setWater(data.water || 0);
};

// Nouvelle fonction de réinitialisation qui préserve la note et l'émotion
const resetFieldsExceptCommon = () => {
  // Réinitialiser catégories spirituelles
  setFajr(0);
  setMasjid(0);
  setSunane(0);
  setWitr(0);
  setDoha(0);
  setQiyam(0);
  setCoran(0);
  setDon(0);
  setAthkar(0);
  setSabah(0);
  setMasae(0);
  setMeditation(0);
  setLecture(0);
  setGratitude(0);
  setCommunity(0);
  
  // Réinitialiser catégories physiques/mentales
  setSport(0);
  setDivertir(0);
  setStress(0);
  setSleep(0);
  setCgm(0);
  setRahim(0);
  setProductivity(0);
  setCreativity(0);
  setNutrition(0);
  setWater(0);
  
  setIsErrorMessage(false);
  setSuccessMessage("");
  
  // Nous ne réinitialisons PAS:
  // - note
  // - mood
  // - definition
};
  
  // Fonction pour remplir le formulaire avec des données
  // Fonction pour remplir le formulaire avec les données d'une entrée
const populateFormWithData = (data) => {
  // Données communes
  setNote(data.note || '');
  
  if (data.mood) {
    setMood(data.mood);
    // Chercher la définition de l'émotion si possible
    const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
    const savedDefinition = savedDefinitions[data.mood];
    if (savedDefinition) {
      setDefinition(savedDefinition);
    } else {
      setDefinition("اختر عاطفة لترى تعريفها");
    }
  }
  
  // Catégories spirituelles
  setFajr(data.fajr || 0);
  setMasjid(data.masjid || 0);
  setSunane(data.sunane || 0);
  setWitr(data.witr || 0);
  setDoha(data.doha || 0);
  setQiyam(data.qiyam || 0);
  setCoran(data.coran || 0);
  setDon(data.don || 0);
  setAthkar(data.athkar || 0);
  setSabah(data.sabah || 0);
  setMasae(data.masae || 0);
  setMeditation(data.meditation || 0);
  setLecture(data.lecture || 0);
  setGratitude(data.gratitude || 0);
  setCommunity(data.community || 0);
  
  // Catégories physiques/mentales
  setSport(data.sport || 0);
  setDivertir(data.divertir || 0);
  setStress(data.stress || 0);
  setSleep(data.sleep || 0);
  setCgm(data.cgm || 0);
  setRahim(data.rahim || 0);
  setProductivity(data.productivity || 0);
  setCreativity(data.creativity || 0);
  setNutrition(data.nutrition || 0);
  setWater(data.water || 0);
};

  // Fonction pour charger une entrée depuis l'historique
  const loadEntryFromHistory = (date) => {
    setSelectedDate(date);
    setActiveSubTab('input');
    loadEntryForDate(date);
  };

  // Gestion online/offline et chargement initial
  // Séparation des effets pour mieux gérer les dépendances
// Effet pour la gestion du chargement de données quand la date ou l'onglet change
useEffect(() => {
  if (selectedDate) {
    loadEntryForDate(selectedDate);
  }
}, [selectedDate]); // Retirer activeTab des dépendances


// Effet séparé pour la gestion online/offline
useEffect(() => {
  const handleOnline = () => {
    console.log("✅ Connexion rétablie - Tentative de synchronisation...");
    setIsOnline(true);
    syncLocalEntries();
  };

  const handleOffline = () => {
    console.log("❌ Connexion perdue");
    setIsOnline(false);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);

  // Chargement des définitions des émotions
  useEffect(() => {
    const loadEmotionDefinitions = async () => {
      console.log('Chargement des définitions...');
      if (isOnline) {
        try {
          console.log('Tentative de récupération depuis Supabase...');
          const { data, error } = await supabase
            .from('emotions')
            .select('*');

          if (error) {
            console.error('Erreur Supabase:', error);
            throw error;
          }

          console.log('Données reçues de Supabase:', data);

          // Création d'un objet avec les émotions comme clés
          const definitions = {};
          data.forEach(item => {
            // Utilisez le nom de la colonne exacte de votre table Supabase
            if (item.emotion_fr && item.definition_ar) {
              definitions[item.emotion_fr] = item.definition_ar;
            }
          });

          console.log('Définitions formatées:', definitions);
          setEmotionDefinitions(definitions);
          localStorage.setItem('emotionDefinitions', JSON.stringify(definitions));
        } catch (error) {
          console.error('Erreur chargement définitions:', error);
          const localDefinitions = JSON.parse(localStorage.getItem('emotionDefinitions')) || {};
          setEmotionDefinitions(localDefinitions);
        }
      } else {
        console.log('Mode hors ligne, chargement depuis le stockage local...');
        const localDefinitions = JSON.parse(localStorage.getItem('emotionDefinitions')) || {};
        setEmotionDefinitions(localDefinitions);
      }
    };

    loadEmotionDefinitions();
  }, [isOnline]);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .order('date', { ascending: false });

          if (error) throw error;
          setEntries(data || []);
        } catch (error) {
          console.error('Erreur de chargement:', error);
          // Charger les données locales en cas d'erreur
          const localData = JSON.parse(localStorage.getItem('moodEntries')) || [];
          setEntries(localData);
        }
      } else {
        const localData = JSON.parse(localStorage.getItem('moodEntries')) || [];
        setEntries(localData);
      }
    };

    loadData();
  }, [isOnline]);
  // Synchronisation des entrées locales avec Supabase
  // Synchronisation des entrées locales avec Supabase - version mise à jour
const syncLocalEntries = async () => {
  if (isSyncingRef.current) {
    console.log("⚠️ Synchronisation déjà en cours, annulation.");
    return;
  }

  if (!navigator.onLine) {
    console.log("❌ Hors ligne - Synchronisation impossible.");
    setSuccessMessage("❌ تعذر المزامنة - أنت غير متصل");
    setIsErrorMessage(true);
    setTimeout(() => setSuccessMessage(""), 3000);
    return;
  }

  let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  console.log("📂 Entrées locales trouvées :", localEntries.length);

  if (localEntries.length === 0) {
    console.log("✅ Aucune entrée locale à synchroniser.");
    setSuccessMessage("✅ لا توجد بيانات محلية للمزامنة");
    setTimeout(() => setSuccessMessage(""), 3000);
    return;
  }

  isSyncingRef.current = true; // 🔒 Verrouille la synchronisation
  setSuccessMessage("🔄 جاري المزامنة...");
  setIsErrorMessage(false);
  
  console.log(`📤 Synchronisation de ${localEntries.length} entrées locales...`);

  try {
    // Pour chaque entrée locale
    for (const localEntry of localEntries) {
      // Vérifier si une entrée existe déjà dans Supabase pour cette date
      const { data: existingData, error: checkError } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('date', localEntry.date);
      
      if (checkError) throw checkError;
      
      if (existingData && existingData.length > 0) {
        // Mise à jour de l'entrée existante
        console.log(`Mise à jour de l'entrée pour ${localEntry.date}`);
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update(localEntry)
          .eq('id', existingData[0].id);
        
        if (updateError) throw updateError;
      } else {
        // Insertion d'une nouvelle entrée
        console.log(`Insertion d'une nouvelle entrée pour ${localEntry.date}`);
        const { error: insertError } = await supabase
          .from('mood_entries')
          .insert([localEntry]);
        
        if (insertError) throw insertError;
      }
    }

    console.log("✅ Synchronisation réussie !");
    localStorage.removeItem("moodEntries"); // ✅ Nettoyage après envoi
    
    // Recharger toutes les entrées
    await reloadEntries();
    
    setSuccessMessage("📡 تمت المزامنة بنجاح!");
    setIsErrorMessage(false);
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation avec Supabase :", error);
    setSuccessMessage("❌ حدث خطأ أثناء المزامنة!");
    setIsErrorMessage(true);
  }

  isSyncingRef.current = false; // 🔓 Déverrouille la synchronisation
  setTimeout(() => setSuccessMessage(""), 3000);
};

  // Star rating component
  const ModernStarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          size={20}
          className="cursor-pointer transition-colors duration-200"
          style={{ color: index + 1 <= value ? (darkMode ? "#60A5FA" : "#3B82F6") : (darkMode ? "#4B5563" : "#E5E7EB") }}
          onClick={() => onChange && onChange(index + 1)}
        />
      ))}
    </div>
  );

  // Fonction de gestion du clic sur une émotion
  const handleEmotionClick = async (emotionName) => {
    console.log("Émotion sélectionnée:", emotionName);
    setMood(emotionName);

    if (!isOnline) {
      console.log("Mode hors ligne - Recherche dans le localStorage");
      const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
      const savedDefinition = savedDefinitions[emotionName];
      if (savedDefinition) {
        console.log("Définition trouvée dans le localStorage:", savedDefinition);
        setDefinition(savedDefinition);
      } else {
        setDefinition("Définition non disponible en mode hors ligne");
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('emotions')
        .select('definition')
        .eq('emotion_fr', emotionName)
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }

      console.log("Données reçues de Supabase:", data);
      if (data) {
        // Sauvegarder la définition dans le localStorage
        const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
        savedDefinitions[emotionName] = data.definition;
        localStorage.setItem("emotionDefinitions", JSON.stringify(savedDefinitions));
        
        setDefinition(data.definition);
      } else {
        setDefinition('Définition non disponible');
      }
    } catch (error) {
      console.error("Erreur:", error);
      setDefinition('Erreur lors de la récupération de la définition');
    }
  };

  // Réinitialisation des champs
  const resetFields = () => {
    setMood(null);
    setNote('');
    
    // Réinitialiser catégories spirituelles
    setFajr(0);
    setMasjid(0);
    setSunane(0);
    setWitr(0);
    setDoha(0);
    setQiyam(0);
    setCoran(0);
    setDon(0);
    setAthkar(0);
    setSabah(0);
    setMasae(0);
    setMeditation(0);
    setLecture(0);
    setGratitude(0);
    setCommunity(0);
    
    // Réinitialiser catégories physiques/mentales
    setSport(0);
    setDivertir(0);
    setStress(0);
    setSleep(0);
    setCgm(0);
    setRahim(0);
    setProductivity(0);
    setCreativity(0);
    setNutrition(0);
    setWater(0);
    
    setDefinition("اختر عاطفة لترى تعريفها");
    setIsErrorMessage(false);
    setSuccessMessage("");
  };
  // Fonction de sauvegarde d'une entrée
  // Continuation de la fonction handleSave
  // Modification de la fonction handleSave pour éviter les doublons
// Version corrigée de la fonction handleSave
// Fonction handleSave révisée pour éviter les doublons
const handleSave = async () => {
  if (!mood) {
    setIsErrorMessage(true);
    setSuccessMessage("الرجاء اختيار العاطفة");
    setTimeout(() => {
      setSuccessMessage("");
      setIsErrorMessage(false);
    }, 3000);
    return;
  }
  
  const noteToSave = note.trim() || "- تم التسجيل بدون ملاحظة -";
  
  console.log("=== DÉBUT DE LA SAUVEGARDE ===");
  console.log(`Date: ${selectedDate}`);
  console.log(`Mode édition: ${isEditMode}`);
  console.log(`En ligne: ${isOnline}`);
  
  const entryData = {
    mood,
    note: noteToSave,
    // Catégories spirituelles
    fajr,
    masjid,
    sunane,
    witr,
    doha,
    qiyam,
    coran,
    don,
    athkar,
    sabah,
    masae,
    meditation,
    lecture,
    gratitude,
    community,
    
    // Catégories physiques/mentales
    sport,
    divertir,
    stress,
    sleep,
    cgm,
    rahim,
    productivity,
    creativity,
    nutrition,
    water,
    
    date: selectedDate,
    heure: new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };

  if (!isOnline) {
    // SAUVEGARDE LOCALE
    console.log("Mode hors ligne - Sauvegarde locale");
    
    let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    
    // Vérifier si une entrée existe déjà pour cette date
    const existingEntryIndex = localEntries.findIndex(e => e.date === selectedDate);
    
    if (existingEntryIndex !== -1) {
      console.log(`Mise à jour de l'entrée locale existante à l'index ${existingEntryIndex}`);
      localEntries[existingEntryIndex] = entryData;
      setSuccessMessage("تم تحديث البيانات محليًا");
    } else {
      console.log("Ajout d'une nouvelle entrée locale");
      localEntries.unshift(entryData);
      setSuccessMessage("تم الحفظ محليًا");
    }
    
    localStorage.setItem("moodEntries", JSON.stringify(localEntries));
    setIsErrorMessage(false);
    
    // Mettre à jour l'état
    updateEntriesState(entryData, existingEntryIndex !== -1);
  } else {
    // SAUVEGARDE EN LIGNE
    try {
      console.log("Mode en ligne - Sauvegarde dans Supabase");
      
      // IMPORTANT: Fetch explicite pour vérifier si une entrée existe déjà
      console.log(`Vérification d'entrée existante pour date=${selectedDate}`);
      const { data: existingData, error: checkError } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('date', selectedDate);
      
      console.log("Résultat de la vérification:", existingData);
      
      if (checkError) {
        console.error("Erreur lors de la vérification:", checkError);
        throw checkError;
      }
      
      if (existingData && existingData.length > 0) {
        // MISE À JOUR: Une entrée existe déjà
        const entryId = existingData[0].id;
        console.log(`Mise à jour de l'entrée existante avec ID=${entryId}`);
        
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update(entryData)
          .eq('id', entryId);
        
        if (updateError) {
          console.error("Erreur lors de la mise à jour:", updateError);
          throw updateError;
        }
        
        console.log("Mise à jour réussie");
        setSuccessMessage("تم تحديث البيانات بنجاح!");
      } else {
        // INSERTION: Aucune entrée existante
        console.log("Insertion d'une nouvelle entrée");
        
        const { data: insertedData, error: insertError } = await supabase
          .from('mood_entries')
          .insert([entryData])
          .select();
        
        if (insertError) {
          console.error("Erreur lors de l'insertion:", insertError);
          throw insertError;
        }
        
        console.log("Insertion réussie:", insertedData);
        setSuccessMessage("لقد تم التسجيل بنجاح!");
      }
      
      setIsErrorMessage(false);
      
      // Recharger toutes les entrées pour avoir la liste à jour
      await reloadEntries();
    } catch (error) {
      console.error("Erreur de sauvegarde Supabase:", error);
      
      // Fallback vers stockage local en cas d'erreur
      let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
      const existingEntryIndex = localEntries.findIndex(e => e.date === selectedDate);
      
      if (existingEntryIndex !== -1) {
        localEntries[existingEntryIndex] = entryData;
      } else {
        localEntries.unshift(entryData);
      }
      
      localStorage.setItem("moodEntries", JSON.stringify(localEntries));
      setIsErrorMessage(false);
      setSuccessMessage("خطأ - تم الحفظ محليًا");
      
      // Mettre à jour l'état
      updateEntriesState(entryData, existingEntryIndex !== -1);
    }
  }

  // Indiquer à l'utilisateur que l'entrée est maintenant en mode édition
  setIsEditMode(true);
  
  // Effacer le message après un délai
  setTimeout(() => setSuccessMessage(""), 3000);
  
  console.log("=== FIN DE LA SAUVEGARDE ===");
};
// Fonction auxiliaire pour mettre à jour l'état des entrées
const updateEntriesState = (updatedEntry, isUpdate = false) => {
  setEntries(prev => {
    const newEntries = [...prev];
    
    // Chercher si l'entrée existe déjà
    const existingIndex = newEntries.findIndex(e => e.date === updatedEntry.date);
    
    if (existingIndex !== -1) {
      console.log(`Mise à jour d'une entrée existante à l'index ${existingIndex}`);
      newEntries[existingIndex] = updatedEntry;
    } else {
      console.log("Ajout d'une nouvelle entrée");
      newEntries.unshift(updatedEntry);
    }
    
    return newEntries;
  });
};
// Fonction pour recharger toutes les entrées
const reloadEntries = async () => {
  if (!isOnline) return;
  
  try {
    console.log("Rechargement de toutes les entrées...");
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Erreur lors du rechargement des entrées:", error);
      throw error;
    }
    
    console.log(`${data.length} entrées chargées avec succès`);
    setEntries(data || []);
  } catch (error) {
    console.error("Erreur lors du rechargement des entrées:", error);
  }
};
// Fonction fallback pour la sauvegarde locale en cas d'erreur
const handleLocalSaveFallback = (entryData, localEntries) => {
  // Vérifier si une entrée existe déjà localement pour cette date et ce type
  const existingEntryIndex = localEntries.findIndex(
    e => e.date === selectedDate && e.entrytype === activeTab
  );
  
  if (existingEntryIndex !== -1) {
    localEntries[existingEntryIndex] = entryData;
  } else {
    localEntries.unshift(entryData);
  }
  
  localStorage.setItem("moodEntries", JSON.stringify(localEntries));
  setSuccessMessage("خطأ - تم الحفظ محليًا");
  setIsErrorMessage(false);
  
  // Mise à jour de l'état des entrées
  setEntries(prev => {
    const newEntries = [...prev];
    const index = newEntries.findIndex(
      e => e.date === selectedDate && e.entrytype === activeTab
    );
    
    if (index !== -1) {
      newEntries[index] = entryData;
    } else {
      newEntries.unshift(entryData);
    }
    
    return newEntries;
  });
};
//////////////////// *******************************************************************//////////////////// *******************************************************************
  // Calcul des scores moyens pour les rapports
  const calculateScores = () => {
    if (entries.length === 0) return { spiritual: 0, physical: 0 };
    
    let spiritualSum = 0;
    let spiritualCount = 0;
    let physicalSum = 0;
    let physicalCount = 0;
    
    entries.forEach(entry => {
      // Somme des valeurs spirituelles
      const spiritualValues = [
        entry.fajr, entry.masjid, entry.sunane, entry.witr,
        entry.doha, entry.qiyam, entry.coran, entry.don,
        entry.athkar, entry.sabah, entry.masae,
        entry.meditation, entry.lecture, entry.gratitude, entry.community
      ].filter(Boolean);
      
      if (spiritualValues.length > 0) {
        spiritualSum += spiritualValues.reduce((a, b) => a + b, 0);
        spiritualCount += spiritualValues.length;
      }
      
      // Somme des valeurs physiques/mentales
      const physicalValues = [
        entry.sport, entry.divertir, entry.stress, entry.sleep,
        entry.cgm, entry.rahim, entry.productivity, entry.creativity,
        entry.nutrition, entry.water
      ].filter(Boolean);
      
      if (physicalValues.length > 0) {
        physicalSum += physicalValues.reduce((a, b) => a + b, 0);
        physicalCount += physicalValues.length;
      }
    });
    
    return {
      spiritual: spiritualCount > 0 ? (spiritualSum / spiritualCount) : 0,
      physical: physicalCount > 0 ? (physicalSum / physicalCount) : 0
    };
  };

  // Fonction pour générer les barres de statistiques mensuelles (suite)
const generateMonthlyStatsBars = () => {
  // Créer un objet pour stocker les données par jour
  const last7Days = [];
  
  // Obtenir les dates des 7 derniers jours
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toISOString().split('T')[0],
      day: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][date.getDay()],
      spiritual: 0,
      physical: 0,
      hasEntry: false
    });
  }
  
  // Remplir avec les données existantes
  entries.forEach(entry => {
    const dayIndex = last7Days.findIndex(day => day.date === entry.date);
    if (dayIndex !== -1) {
      // Calculer le score spirituel
      const spiritualValues = [
        entry.fajr, entry.masjid, entry.sunane, entry.witr,
        entry.doha, entry.qiyam, entry.coran, entry.don,
        entry.athkar, entry.sabah, entry.masae,
        entry.meditation, entry.lecture, entry.gratitude, entry.community
      ].filter(value => value && value > 0);
      
      if (spiritualValues.length > 0) {
        last7Days[dayIndex].spiritual = spiritualValues.reduce((a, b) => a + b, 0) / spiritualValues.length;
      }
      
      // Calculer le score physique
      const physicalValues = [
        entry.sport, entry.divertir, entry.stress, entry.sleep,
        entry.cgm, entry.rahim, entry.productivity, entry.creativity,
        entry.nutrition, entry.water
      ].filter(value => value && value > 0);
      
      if (physicalValues.length > 0) {
        last7Days[dayIndex].physical = physicalValues.reduce((a, b) => a + b, 0) / physicalValues.length;
      }
      
      last7Days[dayIndex].hasEntry = true;
    }
  });
  
  // Générer les barres pour chaque jour
  return last7Days.map((day, index) => {
    // Calculer les hauteurs relatives (max 100px)
    const spiritualHeight = day.spiritual * 20; // 0-5 -> 0-100px
    const physicalHeight = day.physical * 20;  // 0-5 -> 0-100px
    
    return (
      <div key={index} className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <div 
            className={`w-6 ${darkMode ? 'bg-green-500' : 'bg-green-600'}`} 
            style={{ height: `${spiritualHeight}px`, opacity: day.hasEntry ? 1 : 0.3 }}
          ></div>
          <div 
            className={`w-6 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`} 
            style={{ height: `${physicalHeight}px`, opacity: day.hasEntry ? 1 : 0.3 }}
          ></div>
        </div>
        <span className="text-xs mt-2">{day.day}</span>
      </div>
    );
  });
};

// Fonction pour générer un résumé des émotions les plus fréquentes
const generateEmotionsSummary = () => {
  // Compteur d'émotions
  const emotionCounter = {};
  
  // Compter les émotions
  entries.forEach(entry => {
    if (entry.mood) {
      emotionCounter[entry.mood] = (emotionCounter[entry.mood] || 0) + 1;
    }
  });
  
  // Convertir en tableau et trier
  const sortedEmotions = Object.entries(emotionCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3 des émotions
  
  return (
    <div className="mt-8">
      <h4 className="text-center mb-4 font-bold">المشاعر الأكثر تكرارا</h4>
      <div className="flex justify-center gap-6">
        {sortedEmotions.map(([emotion, count], index) => {
          // Trouver l'émotion dans la liste pour obtenir son icône
          const emotionData = emotions.find(e => e.name === emotion);
          
          return (
            <div key={index} className="flex flex-col items-center">
              {emotionData && (
                <img
                  src={`/icons/${emotionData.file}`}
                  alt={emotion}
                  className="w-10 h-10 object-contain mb-2"
                />
              )}
              <span className="font-arabic">{emotion}</span>
              <span className="text-xs mt-1 opacity-70">{count} مرات</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Remplacer la version précédente du renderStatsContent par celle-ci
const renderStatsContent = () => {
  const scores = calculateScores();
  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <h3 className="text-xl text-center mb-6 font-bold">إحصائياتي</h3>
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h4 className="font-bold mb-2">التوازن الروحي</h4>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {(scores.spiritual * 20).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <h4 className="font-bold mb-2">التوازن النفسي والجسدي</h4>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {(scores.physical * 20).toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Statistiques hebdomadaires */}
        <div className="mt-8">
          <h4 className="text-center mb-4 font-bold">النشاط الأسبوعي</h4>
          <div className="h-40 flex items-end justify-between">
            {generateMonthlyStatsBars()}
          </div>
        </div>
        
        {/* Résumé des émotions */}
        {entries.length > 0 && generateEmotionsSummary()}
      </div>
    </div>
  );
};

  // Fonction pour filtrer les entrées par type pour l'historique
  const filterEntriesByType = () => {
    if (historyFilter === 'all') {
      return entries.slice(0, 20); // Limite à 20 entrées pour la performance
    }
    return entries
      .filter(entry => entry.entrytype === historyFilter)
      .slice(0, 20);
  };

  // Fonction pour générer les dates du calendrier - version simplifiée
  const generateCalendarDates = () => {
    const dateArray = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Déterminer le premier jour à afficher
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    // Déterminer le dernier jour à afficher
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    // Générer les jours du calendrier
    let currentDate = new Date(startDay);
    while (currentDate <= endDay) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasEntryData = entries.find(e => e.date === dateString);
      
      dateArray.push({
        day: currentDate.getDate(),
        fullDate: dateString,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: dateString === new Date().toISOString().split('T')[0],
        hasEntry: !!hasEntryData
      });
      
      // Passer au jour suivant
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate = nextDate;
    }
    
    return dateArray;
  };


  // Sélecteur de date
  // Modification du composant date selector pour indiquer l'entrée unique
  const DateSelector = () => (
    <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} mb-4`}>
      <div className="flex items-center">
        <FaCalendarAlt className={darkMode ? 'text-blue-300' : 'text-blue-500'} />
        <span className="mr-2 font-arabic">اختر التاريخ:</span>
      </div>
      <div className="flex items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
          }}
          className={`p-2 rounded-md ${
            darkMode 
              ? 'bg-gray-800 text-white border-gray-600' 
              : 'bg-white text-gray-800 border border-gray-300'
          }`}
        />
        <div className="ml-2">
          <span className={`px-3 py-1 rounded-full text-xs ${
            isEditMode 
              ? (darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800') 
              : (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
          }`}>
            {isEditMode ? (
              <><FaEdit className="inline mr-1" /> تعديل</>
            ) : (
              <><FaPlus className="inline mr-1" /> جديد</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
  // Rendu des catégories par groupe
  const renderCategoryGroups = (categoryGroups) => {
    return categoryGroups.map((group, groupIndex) => (
      <div key={groupIndex} className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h4 className={`text-center text-md mb-4 font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
          {group.group}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {group.items.map((category, index) => (
            <div key={index} className={`rounded-lg p-3 transition-all ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <img 
                  src={category.icon} 
                  alt={category.label} 
                  className="w-5 h-5 object-contain"
                />
                <span className={`font-arabic text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{category.label}</span>
              </div>
              <div className="flex justify-center w-full">
                <ModernStarRating value={category.state} onChange={category.setter} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Rendu du contenu d'entrée
  // Modification du rendu principal pour déplacer la note en haut

// Modifier la partie renderInputContent en séparant la zone d'émotion et de note
const renderInputContent = () => {
  return (
    <div className="space-y-6 py-4">
      {/* Sélecteur de date */}
      <DateSelector />
      
      {loadingEntry ? (
        <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <p className="font-arabic">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <>
          {/* Message de succès ou d'erreur */}
          {successMessage && (
            <div className={`p-3 rounded-md text-center ${isErrorMessage ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {successMessage}
            </div>
          )}
          
          {/* Section des émotions */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className={`text-center text-lg mb-4 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>المشاعر</h3>
            <div className="grid grid-cols-5 gap-4">
              {emotions.map((emotion) => (
                <div 
                  key={emotion.name}
                  className={`flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 ${mood === emotion.name ? 'scale-110' : ''}`}
                  onClick={() => handleEmotionClick(emotion.name)}
                >
                  <div className={`
                    relative p-2 rounded-full transition-all duration-200
                    ${mood === emotion.name ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200')}
                  `}>
                    <img
                      src={`/icons/${emotion.file}`}
                      alt={emotion.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className={`mt-1 font-arabic text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{emotion.name}</span>
                </div>
              ))}
            </div>
            {definition && (
              <div className={`mt-4 p-3 rounded-md text-right ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <p className="font-arabic">{definition}</p>
              </div>
            )}
          </div>

          {/* Zone de commentaire commune (déplacée ici) */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className={`text-center text-lg mb-4 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              ملاحظات
            </h3>
            <textarea
              placeholder="كيف كان يومك؟ وماهي أهم إنجازاتك اليوم؟"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full p-4 text-right rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-arabic ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border border-gray-200'
              }`}
            />
          </div>

          {/* Onglets pour choisir entre spirituel et physique */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-center mb-4">
              <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors font-arabic ${
                    activeTab === 'spiritual' 
                      ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}
                  onClick={() => setActiveTab('spiritual')}
                >
                  <div className="flex items-center gap-1">
                    <FaPrayingHands size={16} />
                    <span>التوازن الروحي</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors font-arabic ${
                    activeTab === 'physical' 
                      ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}
                  onClick={() => setActiveTab('physical')}
                >
                  <div className="flex items-center gap-1">
                    <FaHeartbeat size={16} />
                    <span>التوازن النفسي والجسدي</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Catégories selon l'onglet actif */}
            <h3 className={`text-center text-lg mb-4 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              {activeTab === 'spiritual' ? 'التوازن الروحي' : 'التوازن النفسي والجسدي'}
            </h3>
            
            {activeTab === 'spiritual' 
              ? renderCategoryGroups(spiritualCategories)
              : renderCategoryGroups(physicalMentalCategories)
            }
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button 
              onClick={resetFields}
              className={`flex-1 font-arabic py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center text-white font-arabic ${
                darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaCloudUploadAlt className="mr-2" />
              {isEditMode ? 'تحديث' : 'تسجيل'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
  // Continuation du rendu de l'historique
  const renderHistoryContent = () => {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <h3 className="text-xl text-center mb-6 font-bold">سجل الإدخالات</h3>
        
        {/* Suppression des filtres par type et modification du calendrier */}
        <div className="mb-4 flex justify-between items-center">
          <button 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
          >
            &lt;
          </button>
          <h4 className="text-center font-bold">
            {currentMonth.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </h4>
          <button 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
          >
            &gt;
          </button>
        </div>
        
        {/* Calendrier modifié */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, i) => (
              <div key={i} className="text-center text-xs font-bold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDates().map((dateInfo, index) => (
              <div
                key={index}
                className={`
                  p-2 rounded-md text-center cursor-pointer transition-colors
                  ${dateInfo.hasEntry 
                    ? (darkMode ? 'bg-blue-800' : 'bg-blue-100')
                    : (darkMode ? 'bg-gray-800' : 'bg-gray-50')}
                  ${dateInfo.isCurrentMonth ? '' : 'opacity-40'}
                  ${dateInfo.isToday ? (darkMode ? 'ring-2 ring-yellow-400' : 'ring-2 ring-yellow-500') : ''}
                `}
                onClick={() => {
                  if (dateInfo.hasEntry) {
                    // Charger l'entrée existante
                    loadEntryFromHistory(dateInfo.fullDate);
                  } else {
                    // Créer une nouvelle entrée
                    setSelectedDate(dateInfo.fullDate);
                    resetFields();
                    setIsEditMode(false);
                    setActiveSubTab('input');
                  }
                }}
              >
                <span className={dateInfo.hasEntry ? 'font-bold' : ''}>
                  {dateInfo.day}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Liste des entrées modifiée */}
        <div className="space-y-4">
          <h4 className="font-bold text-center mb-4">آخر الإدخالات</h4>
          {entries.length > 0 ? (
            entries.slice(0, 20).map((entry, i) => (
              <div 
                key={i} 
                className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => loadEntryFromHistory(entry.date)}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm opacity-70">{entry.date} - {entry.heure}</span>
                  <span className="font-bold">{entry.mood}</span>
                </div>
                <p className="text-right font-arabic text-sm">{entry.note}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* Afficher les principales catégories avec des valeurs */}
                  {[
                    { key: 'fajr', label: 'الفجر' },
                    { key: 'coran', label: 'القرآن' },
                    { key: 'meditation', label: 'التأمل' },
                    { key: 'sport', label: 'الرياضة' },
                    { key: 'sleep', label: 'النوم' }
                  ].filter(item => entry[item.key] > 0).map((item) => (
                    <span key={item.key} className={`text-xs px-2 py-1 rounded-full flex items-center ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      {item.label}: {entry[item.key]}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    className={`text-xs px-3 py-1 rounded-full flex items-center ${
                      darkMode 
                        ? 'bg-blue-700 text-white hover:bg-blue-600' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher que l'événement onClick du parent soit aussi déclenché
                      loadEntryFromHistory(entry.date);
                    }}
                  >
                    <FaEdit className="mr-1" />
                    تعديل
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <p className="font-arabic">لا توجد إدخالات</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  // Rendu du contenu des paramètres
  // Correction pour le rendu du contenu des paramètres
const renderSettingsContent = () => {
  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <h3 className="text-xl text-center mb-6 font-bold">الإعدادات</h3>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-between`}>
          <span className="font-arabic">الوضع المظلم</span>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-between`}>
          <span className="font-arabic">مزامنة البيانات</span>
          <button 
            onClick={syncLocalEntries}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg font-arabic ${
              darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'  
            }`}
          >
            <FaSyncAlt />
            مزامنة الآن
          </button>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-between`}>
          <span className="font-arabic">حذف كل البيانات</span>
          <button 
            onClick={handleDeleteAllData}
            className="bg-red-600 hover:bg-red-700 text-white font-arabic py-2 px-4 rounded-lg transition-colors duration-200"
          >
            حذف
          </button>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="text-center mb-2">
            <p className="font-arabic font-bold">عن التطبيق</p>
          </div>
          <p className="text-sm text-center font-arabic mb-2">LifeSky - تطبيق تتبع التوازن الروحي والنفسي والجسدي</p>
          <p className="text-xs text-center opacity-70">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
  const handleDeleteAllData = () => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف جميع البيانات المحلية؟')) {
      localStorage.removeItem("moodEntries");
      setEntries([]);
      setSuccessMessage("تم حذف جميع البيانات المحلية");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };
  // Rendu du contenu selon l'onglet actif
  const renderContent = () => {
    // Contenu de saisie (commun aux deux onglets principaux)
    if (activeSubTab === 'input') {
      return renderInputContent();
    }
    
    // Contenu des statistiques
    if (activeSubTab === 'stats') {
      return renderStatsContent();
    }
    
    // Contenu de l'historique
    if (activeSubTab === 'history') {
      return renderHistoryContent();
    }
    
    // Contenu des paramètres
    if (activeSubTab === 'settings') {
      return renderSettingsContent();
    }
    
    return null;
  };
  // Rendu principal de l'application
  // Mise à jour du rendu principal de l'application
return (
  <div className={`min-h-screen pb-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
    {/* Header */}
    <header className={`py-4 px-6 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 inline-block text-transparent bg-clip-text">
          LifeSky
        </h1>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-arabic">{isOnline ? 'متصل' : 'غير متصل'}</span>
        </div>
      </div>
      <p className="text-center mt-2 font-arabic">التوازن الروحي والنفسي والجسدي</p>
      <p className="text-center text-xs opacity-70 mt-1">
        {new Date().toLocaleDateString('ar-SA', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </header>

    {/* Nous avons supprimé la navigation principale (secondary navigation) spirituel/physique
       car elle est maintenant intégrée dans le contenu */}

    {/* Main content */}
    <main className="max-w-4xl mx-auto p-4">
      {renderContent()}
    </main>

    {/* Navigation inférieure */}
    <nav className={`fixed bottom-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-10`}>
      <div className="flex justify-around items-center py-3">
        <button 
          onClick={() => setActiveSubTab('input')}
          className={`flex flex-col items-center p-2 ${
            activeSubTab === 'input' 
              ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
              : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}
        >
          <FaCloudUploadAlt size={20} />
          <span className="text-xs mt-1 font-arabic">تسجيل</span>
        </button>
        
        <button 
          onClick={() => setActiveSubTab('stats')}
          className={`flex flex-col items-center p-2 ${
            activeSubTab === 'stats' 
              ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
              : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}
        >
          <FaChartBar size={20} />
          <span className="text-xs mt-1 font-arabic">إحصائيات</span>
        </button>
        
        <button 
          onClick={() => setActiveSubTab('history')}
          className={`flex flex-col items-center p-2 ${
            activeSubTab === 'history' 
              ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
              : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}
        >
          <FaHistory size={20} />
          <span className="text-xs mt-1 font-arabic">تاريخ</span>
        </button>
        
        <button 
          onClick={() => setActiveSubTab('settings')}
          className={`flex flex-col items-center p-2 ${
            activeSubTab === 'settings' 
              ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
              : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}
        >
          <FaCog size={20} />
          <span className="text-xs mt-1 font-arabic">إعدادات</span>
        </button>
      </div>
    </nav>
  </div>
);
};

export default LifeSkyApp;