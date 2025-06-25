import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaChartBar, FaPrayingHands, FaHeartbeat, FaHistory, FaCog, FaCloudUploadAlt, 
         FaMoon, FaSun, FaSyncAlt, FaCalendarAlt, FaEdit, FaPlus, FaChevronLeft, FaChevronRight, 
         FaAngleDoubleRight, FaAngleDoubleLeft, FaDownload, FaFilePdf } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LifeSkyApp = () => {
  // Navigation et UI
  const [activeTab, setActiveTab] = useState('spiritual'); // spiritual/physical pour la compatibilité
  const [activeSubTab, setActiveSubTab] = useState('input'); // Sous-onglet: input, stats, history, settings
  const [activeInputPage, setActiveInputPage] = useState('emotions'); // emotions, spiritual, physical
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
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  
  // États de connexion et synchronisation
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const isSyncingRef = useRef(false);
  
  // États des émotions
  const [definition, setDefinition] = useState('اختر عاطفة لترى تعريفها');
  const [emotionDefinitions, setEmotionDefinitions] = useState({});

  // États pour les animations et la sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);

  // États pour PWA
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Références pour le swipe
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const inputContainerRef = useRef(null);

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

  // Styles CSS pour les animations
  const slideStyles = `
    @keyframes slideLeft {
      from { transform: translateX(0); opacity: 0.8; }
      to { transform: translateX(-20px); opacity: 0; }
    }
    
    @keyframes slideRight {
      from { transform: translateX(0); opacity: 0.8; }
      to { transform: translateX(20px); opacity: 0; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .slide-left {
      animation: slideLeft 0.2s forwards, fadeIn 0.2s 0.2s forwards;
    }
    
    .slide-right {
      animation: slideRight 0.2s forwards, fadeIn 0.2s 0.2s forwards;
    }
  `;

  // Configuration pour le glissement (swipe)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    
    // Animation de mouvement pendant le swipe (facultatif)
    if (touchStartX.current && inputContainerRef.current) {
      const difference = touchStartX.current - e.touches[0].clientX;
      // Limiter le déplacement pour éviter de trop glisser
      if (
        (activeInputPage === 'emotions' && difference < 0) || 
        (activeInputPage === 'physical' && difference > 0)
      ) {
        return; // Empêcher le glissement au-delà des limites
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current && touchEndX.current) {
      const difference = touchStartX.current - touchEndX.current;
      const threshold = 80; // Seuil minimum pour considérer comme un swipe

      // Réinitialiser la transformation
      if (inputContainerRef.current) {
        inputContainerRef.current.style.transform = '';
      }

      if (Math.abs(difference) > threshold) {
        if (difference > 0) {
          // Swipe vers la gauche (prochain onglet)
          handleNextPage();
        } else {
          // Swipe vers la droite (onglet précédent)
          handlePrevPage();
        }
      }
    }
    
    // Réinitialiser
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleNextPage = () => {
    if (activeInputPage === 'emotions') {
      setActiveInputPage('spiritual');
      // Animation de transition (facultative)
      if (inputContainerRef.current) {
        inputContainerRef.current.classList.add('slide-left');
        setTimeout(() => {
          inputContainerRef.current.classList.remove('slide-left');
        }, 300);
      }
    } else if (activeInputPage === 'spiritual') {
      setActiveInputPage('physical');
      if (inputContainerRef.current) {
        inputContainerRef.current.classList.add('slide-left');
        setTimeout(() => {
          inputContainerRef.current.classList.remove('slide-left');
        }, 300);
      }
    }
  };

  const handlePrevPage = () => {
    if (activeInputPage === 'physical') {
      setActiveInputPage('spiritual');
      // Animation de transition (facultative)
      if (inputContainerRef.current) {
        inputContainerRef.current.classList.add('slide-right');
        setTimeout(() => {
          inputContainerRef.current.classList.remove('slide-right');
        }, 300);
      }
    } else if (activeInputPage === 'spiritual') {
      setActiveInputPage('emotions');
      if (inputContainerRef.current) {
        inputContainerRef.current.classList.add('slide-right');
        setTimeout(() => {
          inputContainerRef.current.classList.remove('slide-right');
        }, 300);
      }
    }
  };

  // Fonction pour charger les données d'une date spécifique
  const loadEntryForDate = async (date) => {
    setLoadingEntry(true);
    
    console.log(`Chargement des données pour la date: ${date}`);
    
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('date', date);
        
        console.log("Résultat de la requête:", data, error);
        
        if (error) {
          console.error('Erreur lors du chargement:', error);
          loadFromLocalStorage(date);
        } else if (data && data.length > 0) {
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

  // Fonction pour charger depuis localStorage
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
      resetFields(); 
    }
  };

  // Fonction pour remplir le formulaire avec des données
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

  // Fonction de gestion du clic sur une émotion
  // Fonction de gestion du clic sur une émotion
const handleEmotionClick = async (emotionName) => {
  console.log("Émotion sélectionnée:", emotionName);
  
  // Effet visuel temporaire de sélection
  const targetElement = document.querySelector(`[data-emotion="${emotionName}"]`);
  if (targetElement) {
    targetElement.classList.add('emotion-selected');
    setTimeout(() => {
      targetElement.classList.remove('emotion-selected');
    }, 300);
  }
  
  // Mise à jour de l'état
  setMood(emotionName);
  
  // Gestion de l'affichage de la définition
  if (!isOnline) {
    console.log("Mode hors ligne - Recherche dans le localStorage");
    const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
    const savedDefinition = savedDefinitions[emotionName];
    if (savedDefinition) {
      console.log("Définition trouvée dans le localStorage:", savedDefinition);
      setDefinition(savedDefinition);
      
      // Animation pour afficher la définition
      const definitionElement = document.querySelector('.emotion-definition');
      if (definitionElement) {
        definitionElement.classList.add('definition-fade-in');
        setTimeout(() => {
          definitionElement.classList.remove('definition-fade-in');
        }, 500);
      }
    } else {
      setDefinition("التعريف غير متاح في وضع عدم الاتصال");
    }
    return;
  }

  try {
    // Animation de chargement
    setDefinition("جاري تحميل التعريف...");
    
    console.log("Envoi de la requête Supabase pour l'émotion:", emotionName);
    
    // Correction: Utiliser 'emotion_fr' au lieu de 'name'
    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('emotion_fr', emotionName)
      .single();

    console.log("Réponse Supabase complète:", { data, error });

    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }

    // Dans la fonction handleEmotionClick, modifiez la partie qui traite la réponse de Supabase
    if (data) {
      console.log("Données reçues de Supabase:", data);
      
      // Utiliser la colonne 'definition' au lieu de 'definition_ar'
      const definitionText = data.definition;
      
      if (definitionText) {
        // Sauvegarder la définition dans le localStorage
        const savedDefinitions = JSON.parse(localStorage.getItem("emotionDefinitions")) || {};
        savedDefinitions[emotionName] = definitionText;
        localStorage.setItem("emotionDefinitions", JSON.stringify(savedDefinitions));
        
        // Animation pour afficher la définition
        setDefinition(definitionText);
        const definitionElement = document.querySelector('.emotion-definition');
        if (definitionElement) {
          definitionElement.classList.add('definition-fade-in');
          setTimeout(() => {
            definitionElement.classList.remove('definition-fade-in');
          }, 500);
        }
      } else {
        setDefinition('لم يتم العثور على تعريف');
      }
    } else {
      setDefinition('التعريف غير متاح');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la définition:", error);
    setDefinition('خطأ في استرجاع التعريف');
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

  // Fonction de sauvegarde d'une entrée avec feedback visuel
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
  
    setIsSaving(true);
    setSaveAnimation(true);
  
    await new Promise(resolve => setTimeout(resolve, 800));
  
    const entryData = {
      mood,
      note: note.trim() || "- تم التسجيل بدون ملاحظة -",
      fajr, masjid, sunane, witr, doha, qiyam, coran, don, athkar, sabah, masae,
      meditation, lecture, gratitude, community, sport, divertir, stress, sleep,
      cgm, rahim, productivity, creativity, nutrition, water,
      date: selectedDate,
      heure: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  
    if (!isOnline) {
      console.log("Mode hors ligne - Sauvegarde locale");
  
      let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  
      // Trouver l'index de l'entrée existante
      const existingEntryIndex = localEntries.findIndex(e => e.date === selectedDate);
  
      if (existingEntryIndex !== -1) {
        console.log(`🔄 Mise à jour de l'entrée locale existante pour ${selectedDate}`);
        // Remplacer l'entrée existante
        localEntries[existingEntryIndex] = entryData;
        setSuccessMessage("تم تحديث البيانات محليًا");
      } else {
        console.log("✅ Ajout d'une nouvelle entrée locale");
        localEntries.unshift(entryData);
        setSuccessMessage("تم الحفظ محليًا");
      }
  
      localStorage.setItem("moodEntries", JSON.stringify(localEntries));
      setIsEditMode(true);
      setIsErrorMessage(false);
      updateEntriesState(entryData, existingEntryIndex !== -1);
    } else {
      // Mode en ligne - Vérification et sauvegarde dans Supabase
      try {
        console.log("Mode en ligne - Vérification de l'entrée existante");
  
        // Récupérer une entrée existante
        const { data: existingData, error: checkError } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('date', selectedDate)
          .single();
  
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
  
        if (existingData) {
          // Mise à jour de l'entrée existante
          console.log(`🔄 Mise à jour de l'entrée existante ID=${existingData.id}`);
  
          const { error: updateError } = await supabase
            .from('mood_entries')
            .update(entryData)
            .eq('id', existingData.id);
  
          if (updateError) throw updateError;
          setSuccessMessage("تم تحديث البيانات بنجاح!");
        } else {
          // Insertion d'une nouvelle entrée
          console.log("✅ Insertion d'une nouvelle entrée");
  
          const { error: insertError } = await supabase
            .from('mood_entries')
            .insert([entryData]);
  
          if (insertError) throw insertError;
          setSuccessMessage("لقد تم التسجيل بنجاح!");
        }
  
        setIsEditMode(true);
        setIsErrorMessage(false);
        await reloadEntries();
      } catch (error) {
        console.error("❌ Erreur de sauvegarde Supabase:", error);
  
        let localEntries = JSON.parse(localStorage.getItem("moodEntries")) || [];
        const existingEntryIndex = localEntries.findIndex(e => e.date === selectedDate);
  
        if (existingEntryIndex !== -1) {
          console.log(`🔄 Mise à jour locale en fallback pour ${selectedDate}`);
          localEntries[existingEntryIndex] = entryData;
        } else {
          console.log("✅ Ajout d'une nouvelle entrée locale en fallback");
          localEntries.unshift(entryData);
        }
  
        localStorage.setItem("moodEntries", JSON.stringify(localEntries));
        setIsErrorMessage(false);
        setSuccessMessage("خطأ - تم الحفظ محليًا");
        updateEntriesState(entryData, existingEntryIndex !== -1);
      }
    }
  
    setIsSaving(false);
    setSaveAnimation(false);
    setTimeout(() => setSuccessMessage(""), 3000);
    console.log("=== FIN DE LA SAUVEGARDE ===");
  };
  // Fonction pour mettre à jour l'état des entrées
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
      setEntriesLoading(true); // État à ajouter pour indiquer le chargement des entrées
      
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
      
      // Prétraitement des données avant de mettre à jour l'état
      const processedData = data.map(entry => {
        // Vérifier et corriger les valeurs nulles
        const cleanEntry = { ...entry };
        
        // Catégories spirituelles: s'assurer qu'il n'y a pas de valeurs null
        const spiritualCategories = [
          'fajr', 'masjid', 'sunane', 'witr', 'doha', 'qiyam', 
          'coran', 'don', 'athkar', 'sabah', 'masae', 
          'meditation', 'lecture', 'gratitude', 'community'
        ];
        
        spiritualCategories.forEach(category => {
          if (cleanEntry[category] === null) cleanEntry[category] = 0;
        });
        
        // Catégories physiques/mentales
        const physicalCategories = [
          'sport', 'divertir', 'stress', 'sleep', 'cgm', 
          'rahim', 'productivity', 'creativity', 'nutrition', 'water'
        ];
        
        physicalCategories.forEach(category => {
          if (cleanEntry[category] === null) cleanEntry[category] = 0;
        });
        
        // S'assurer que note existe
        if (!cleanEntry.note) cleanEntry.note = '';
        
        return cleanEntry;
      });
      
      // Mise à jour de l'état avec les données nettoyées
      setEntries(processedData || []);
      
      // Mise à jour du stockage local pour une utilisation hors ligne
      localStorage.setItem('entriesCache', JSON.stringify(processedData));
      localStorage.setItem('entriesCacheDate', new Date().toISOString());
    } catch (error) {
      console.error("Erreur lors du rechargement des entrées:", error);
      
      // En cas d'erreur, essayer d'utiliser le cache local
      const cachedEntries = JSON.parse(localStorage.getItem('entriesCache')) || [];
      if (cachedEntries.length > 0) {
        console.log("Utilisation du cache local pour les entrées:", cachedEntries.length);
        setEntries(cachedEntries);
      }
    } finally {
      setEntriesLoading(false);
    }
  };

  // Fonction améliorée pour synchroniser les entrées locales avec Supabase
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

    isSyncingRef.current = true; // Verrouille la synchronisation
    setSyncing(true); // État à ajouter pour l'indicateur visuel de synchronisation
    setSuccessMessage("🔄 جاري المزامنة...");
    setIsErrorMessage(false);
    
    console.log(`📤 Synchronisation de ${localEntries.length} entrées locales...`);

    try {
      // Tableau pour suivre les entrées synchronisées avec succès
      const syncedEntries = [];
      
      // Pour chaque entrée locale
      for (const localEntry of localEntries) {
        try {
          // Vérifier si une entrée existe déjà dans Supabase pour cette date
          const { data: existingData, error: checkError } = await supabase
            .from('mood_entries')
            .select('id')
            .eq('date', selectedDate)
            .limit(1) // Empêcher plusieurs entrées
            .single(); // Récupérer une seule entrée

          if (checkError) {
            console.error(`Erreur lors de la vérification de l'entrée ${localEntry.date}:`, checkError);
            continue; // Passer à l'entrée suivante
          }
          
          if (existingData) { // Si une entrée existe déjà
            // Mise à jour de l'entrée existante
            console.log(`Mise à jour de l'entrée pour ${localEntry.date}`);
            const { error: updateError } = await supabase
              .from('mood_entries')
              .update(localEntry)
              .eq('id', existingData[0].id);
            
            if (updateError) {
              console.error(`Erreur lors de la mise à jour de l'entrée ${localEntry.date}:`, updateError);
              continue; // Passer à l'entrée suivante
            }
          } else {
            // Insertion d'une nouvelle entrée
            console.log(`Insertion d'une nouvelle entrée pour ${localEntry.date}`);
            const { error: insertError } = await supabase
              .from('mood_entries')
              .insert([localEntry]);
            
            if (insertError) {
              console.error(`Erreur lors de l'insertion de l'entrée ${localEntry.date}:`, insertError);
              continue; // Passer à l'entrée suivante
            }
          }
          
          // Si on arrive ici, l'entrée a été synchronisée avec succès
          syncedEntries.push(localEntry.date);
        } catch (error) {
          console.error(`Erreur générale lors du traitement de l'entrée ${localEntry.date}:`, error);
        }
      }
      
      console.log(`✅ ${syncedEntries.length}/${localEntries.length} entrées synchronisées avec succès!`);
      
      // Ne supprimer que les entrées synchronisées avec succès
      if (syncedEntries.length > 0) {
        // Filtrer les entrées locales pour ne garder que celles qui n'ont pas été synchronisées
        const remainingEntries = localEntries.filter(entry => !syncedEntries.includes(entry.date));
        
        if (remainingEntries.length > 0) {
          // Il reste des entrées non synchronisées
          localStorage.setItem("moodEntries", JSON.stringify(remainingEntries));
          console.log(`⚠️ ${remainingEntries.length} entrées n'ont pas pu être synchronisées.`);
          setSuccessMessage(`📡 تمت مزامنة ${syncedEntries.length} عنصر من أصل ${localEntries.length}`);
        } else {
          // Toutes les entrées ont été synchronisées
          localStorage.removeItem("moodEntries");
          setSuccessMessage("📡 تمت المزامنة بنجاح!");
        }
      } else {
        // Aucune entrée n'a été synchronisée
        setSuccessMessage("❌ فشلت مزامنة جميع العناصر!");
        setIsErrorMessage(true);
      }
      
      // Recharger toutes les entrées
      await reloadEntries();
    } catch (error) {
      console.error("❌ Erreur générale lors de la synchronisation avec Supabase :", error);
      setSuccessMessage("❌ حدث خطأ أثناء المزامنة!");
      setIsErrorMessage(true);
    } finally {
      isSyncingRef.current = false; // Déverrouille la synchronisation
      setSyncing(false); // Fin de l'indicateur visuel
      
      // Effacer le message après un délai
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Fonction pour installer l'application en tant que PWA
  const installPWA = async () => {
    // Vérifier si la fonctionnalité est supportée
    if (!deferredPrompt) {
      console.log("L'installation PWA n'est pas disponible");
      setSuccessMessage("عفوا، لا يمكن تثبيت التطبيق على هذا الجهاز");
      setIsErrorMessage(true);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    // Afficher l'invite d'installation
    deferredPrompt.prompt();
    
    // Attendre la décision de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Résultat de l'installation PWA: ${outcome}`);
    
    // Réinitialiser la variable après utilisation
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setSuccessMessage("تم تثبيت التطبيق بنجاح!");
    } else {
      setSuccessMessage("تم إلغاء عملية التثبيت");
      setIsErrorMessage(true);
    }
    
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Suppression de toutes les données
  const handleDeleteAllData = () => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف جميع البيانات المحلية؟')) {
      localStorage.removeItem("moodEntries");
      localStorage.removeItem("entriesCache");
      localStorage.removeItem("entriesCacheDate");
      // Garder les définitions d'émotions
      setEntries([]);
      resetFields();
      setSuccessMessage("تم حذف جميع البيانات المحلية");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Fonction pour générer des rapports PDF
  const generatePdfReport = async () => {
    try {
      setSavingPdf(true); // État à ajouter pour l'indicateur visuel
      
      // Vérifier si jsPDF est disponible
      if (typeof jsPDF === 'undefined') {
        // Charger la bibliothèque jsPDF dynamiquement si elle n'est pas déjà disponible
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
      }
      
      // Créer une nouvelle instance de jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Définir la police pour le support de l'arabe
      doc.addFont('path/to/arabic-font.ttf', 'arabic', 'normal');
      doc.setFont('arabic');
      doc.setR2L(true); // Activer le mode de droite à gauche pour l'arabe
      
      // Fonction de chargement d'un script
      function loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Ajouter le titre du rapport
      doc.setFontSize(24);
      doc.text('تقرير LifeSky', doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      // Ajouter les statistiques globales
      const scores = calculateScores();
      doc.setFontSize(16);
      doc.text('ملخص الأداء', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`التوازن الروحي: ${(scores.spiritual * 20).toFixed(1)}%`, 20, 55);
      doc.text(`التوازن النفسي والجسدي: ${(scores.physical * 20).toFixed(1)}%`, 20, 65);
      
      // Ajouter un tableau des dernières entrées
      doc.setFontSize(16);
      doc.text('آخر الإدخالات', doc.internal.pageSize.width / 2, 80, { align: 'center' });
      
      // Préparer les données pour le tableau
      const tableData = entries.slice(0, 10).map(entry => [
        entry.date,
        entry.mood,
        entry.note.substring(0, 30) + (entry.note.length > 30 ? '...' : '')
      ]);
      
      // Ajouter le tableau
      doc.autoTable({
        startY: 85,
        head: [['التاريخ', 'المشاعر', 'ملاحظات']],
        body: tableData,
        theme: 'grid',
        styles: { font: 'arabic', halign: 'right' },
        headStyles: { fillColor: [66, 133, 244] }
      });
      
      // Sauvegarder le PDF
      doc.save('LifeSky_Report.pdf');
      
      setSuccessMessage("تم إنشاء التقرير بنجاح!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      setSuccessMessage("حدث خطأ أثناء إنشاء التقرير!");
      setIsErrorMessage(true);
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setSavingPdf(false);
    }
  };
  useEffect(() => {
    // 🔍 Vérifier si le localStorage contient bien un tableau valide
    const localEntries = localStorage.getItem("moodEntries");
    
    try {
        const parsedEntries = JSON.parse(localEntries);
        
        if (!Array.isArray(parsedEntries)) {
            console.warn("⚠️ Données locales corrompues, réinitialisation...");
            localStorage.removeItem("moodEntries");
        }
    } catch (error) {
        console.error("❌ Erreur parsing localStorage, réinitialisation...");
        localStorage.removeItem("moodEntries");
    }
}, []);

  // Gestion du défilement entre les pages
  useEffect(() => {
    // Fonction pour gérer les gestes de défilement
    const handleSwipeGesture = (e) => {
      if (!inputContainerRef.current) return;
      
      // Détection du défilement horizontal
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 50) {
        if (e.deltaX > 0) {
          // Défilement vers la gauche (page suivante)
          handleNextPage();
        } else {
          // Défilement vers la droite (page précédente)
          handlePrevPage();
        }
      }
    };
    
    // Ajout d'un gestionnaire d'événements pour les interactions tactiles
    const currentRef = inputContainerRef.current;
    
    if (currentRef) {
      // Si nous utilisons une bibliothèque comme hammerjs, nous pourrions l'utiliser ici
      // Pour l'exemple, nous utilisons les événements tactiles natifs
      currentRef.addEventListener('touchstart', handleTouchStart);
      currentRef.addEventListener('touchmove', handleTouchMove);
      currentRef.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      // Nettoyage des gestionnaires d'événements
      if (currentRef) {
        currentRef.removeEventListener('touchstart', handleTouchStart);
        currentRef.removeEventListener('touchmove', handleTouchMove);
        currentRef.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [activeInputPage]); // Réagir aux changements de page active

  // Effet pour la gestion du chargement de données quand la date change
  useEffect(() => {
    if (selectedDate) {
      loadEntryForDate(selectedDate);
    }
  }, [selectedDate]);
  
  // Effet pour appliquer des styles CSS dynamiques pour l'animation entre pages
  useEffect(() => {
    // Injection de styles CSS pour les animations de transition entre pages
    const styleTag = document.createElement('style');
    styleTag.setAttribute('id', 'lifesky-transitions');
    
    styleTag.innerHTML = `
      /* Animation pour le changement de page */
      @keyframes slideInFromRight {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideInFromLeft {
        0% { transform: translateX(-100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutToRight {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      
      @keyframes slideOutToLeft {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(-100%); opacity: 0; }
      }
      
      .slide-in-right {
        animation: slideInFromRight 0.3s forwards;
      }
      
      .slide-in-left {
        animation: slideInFromLeft 0.3s forwards;
      }
      
      .slide-out-right {
        animation: slideOutToRight 0.3s forwards;
      }
      
      .slide-out-left {
        animation: slideOutToLeft 0.3s forwards;
      }
      
      /* Styles pour les boutons de navigation */
      .nav-button {
        transition: all 0.2s ease;
      }
      
      .nav-button:active {
        transform: scale(0.95);
      }
    `;
    
    // Vérifier si le style existe déjà pour éviter les doublons
    if (!document.getElementById('lifesky-transitions')) {
      document.head.appendChild(styleTag);
    }
    
    return () => {
      // Nettoyage
      const existingStyle = document.getElementById('lifesky-transitions');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

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

  // Hooks pour gérer l'installation PWA
  useEffect(() => {
    // Événement déclenché quand l'app peut être installée
    const handleBeforeInstallPrompt = (e) => {
      // Empêcher Chrome de montrer l'invite par défaut
      e.preventDefault();
      // Sauvegarder l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      // Mettre à jour l'état pour indiquer que l'app peut être installée
      setCanInstall(true);
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Nettoyer l'écouteur quand le composant est démonté
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Star rating component
  

  // Calcul du pourcentage de complétion global du formulaire
  const calculateCompletionPercentage = () => {
    // Vérifier si l'émotion est sélectionnée
    const emotionCompleted = mood !== null ? 1 : 0;
    const noteCompleted = note.trim().length > 0 ? 1 : 0;
    
    // Compter les catégories spirituelles complétées (valeur > 0)
    const spiritualFields = [
      fajr, masjid, sunane, witr, doha, qiyam, coran, don,
      athkar, sabah, masae, meditation, lecture, gratitude, community
    ];
    
    const spiritualCompleted = spiritualFields.filter(val => val > 0).length;
    const spiritualTotal = spiritualFields.length;
    
    // Compter les catégories physiques/mentales complétées (valeur > 0)
    const physicalFields = [
      sport, divertir, stress, sleep, cgm, rahim, 
      productivity, creativity, nutrition, water
    ];
    
    const physicalCompleted = physicalFields.filter(val => val > 0).length;
    const physicalTotal = physicalFields.length;
    
    // Calculer le pourcentage global - pondération: émotions (40%), spirituel (30%), physique (30%)
    const emotionWeight = 0.4; 
    const spiritualWeight = 0.3;
    const physicalWeight = 0.3;
    
    const emotionScore = (emotionCompleted + noteCompleted) / 2; // 0 à 1
    const spiritualScore = spiritualCompleted / spiritualTotal;   // 0 à 1 
    const physicalScore = physicalCompleted / physicalTotal;      // 0 à 1
    
    // Calculer le score pondéré total (0 à 100%)
    const totalScore = (
      (emotionScore * emotionWeight) + 
      (spiritualScore * spiritualWeight) + 
      (physicalScore * physicalWeight)
    ) * 100;
    
    return Math.round(totalScore);
  };

  // Calculer le résumé des données pour chaque page
  const calculatePageSummary = (page) => {
    if (page === 'emotions') {
      return {
        completed: mood !== null && note.trim().length > 0,
        items: [
          { label: 'المشاعر', value: mood || '-', color: 'blue' },
          { label: 'ملاحظات', value: note.trim() ? '✓' : '-', color: 'gray' }
        ]
      };
    }
    else if (page === 'spiritual') {
      const spiritualFields = [
        { key: 'fajr', label: 'الفجر', value: fajr },
        { key: 'masjid', label: 'المسجد', value: masjid },
        { key: 'coran', label: 'القرآن', value: coran },
        { key: 'athkar', label: 'الأذكار', value: athkar }
      ];
      
      const completedItems = spiritualFields.filter(item => item.value > 0);
      
      return {
        completed: completedItems.length > 0,
        items: completedItems.length > 0 ? 
          completedItems.slice(0, 3).map(item => ({ 
            label: item.label, 
            value: item.value, 
            color: 'green' 
          })) : 
          [{ label: 'غير مكتمل', value: '-', color: 'gray' }]
      };
    }
    else if (page === 'physical') {
      const physicalFields = [
        { key: 'sport', label: 'الرياضة', value: sport },
        { key: 'sleep', label: 'النوم', value: sleep },
        { key: 'nutrition', label: 'التغذية', value: nutrition },
        { key: 'water', label: 'الماء', value: water }
      ];
      
      const completedItems = physicalFields.filter(item => item.value > 0);
      
      return {
        completed: completedItems.length > 0,
        items: completedItems.length > 0 ? 
          completedItems.slice(0, 3).map(item => ({ 
            label: item.label, 
            value: item.value, 
            color: 'indigo' 
          })) : 
          [{ label: 'غير مكتمل', value: '-', color: 'gray' }]
      };
    }
    return { completed: false, items: [] };
  };

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

  // Fonction pour générer les barres de statistiques mensuelles
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

  // Générer les dates du calendrier pour l'historique
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
  // Sélecteur de date
// Sélecteur de date plus compact
const DateSelector = () => (
  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} mb-2`}>
    <div className="flex items-center">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
        }}
        className={`p-1 text-sm rounded-md ${
          darkMode 
            ? 'bg-gray-800 text-white border-gray-600' 
            : 'bg-white text-gray-800 border border-gray-300'
        }`}
      />
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
        isEditMode 
          ? (darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800') 
          : (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
      }`}>
        {isEditMode ? "تعديل" : "جديد"}
      </span>
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

  // Rendu de la navigation à trois onglets pour la saisie
  // Rendu de la navigation à trois onglets pour la saisie
const renderInputTabNavigation = () => {
  return (
    <div className={`mb-2 flex justify-center items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <div className="flex space-x-4">
        {['emotions', 'spiritual', 'physical'].map((page) => (
          <div 
            key={page}
            className={`h-3 w-3 rounded-full transition-all cursor-pointer ${
              activeInputPage === page 
                ? (darkMode ? 'bg-blue-400 scale-125' : 'bg-blue-500 scale-125') 
                : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
            }`}
            onClick={() => setActiveInputPage(page)}
          />
        ))}
      </div>
    </div>
  );
};

  // Pages du formulaire de saisie
  const renderEmotionsPage = () => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-center text-lg mb-6 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>المشاعر</h3>
      
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="grid grid-cols-5 gap-4">
          {emotions.map((emotion) => (
            <div 
              key={emotion.name}
              data-emotion={emotion.name}
              className={`flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 ${
                mood === emotion.name ? 'scale-110 emotion-active' : ''
              }`}
              onClick={() => handleEmotionClick(emotion.name)}
            >
              <div className={`
                relative p-2 rounded-full transition-all duration-200
                ${mood === emotion.name 
                  ? (darkMode ? 'bg-blue-900 shadow-lg shadow-blue-500/50' : 'bg-blue-100 shadow-md shadow-blue-300/50') 
                  : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200')}
              `}>
                <img
                  src={`/icons/${emotion.file}`}
                  alt={emotion.name}
                  className={`w-8 h-8 object-contain ${mood === emotion.name ? 'emotion-pulse' : ''}`}
                />
              </div>
              <span className={`mt-1 font-arabic text-sm ${
                mood === emotion.name 
                  ? (darkMode ? 'text-blue-300 font-medium' : 'text-blue-600 font-medium') 
                  : (darkMode ? 'text-gray-300' : 'text-gray-600')
              }`}>{emotion.name}</span>
            </div>
          ))}
        </div>
        
        {definition && (
          <div className={`mt-6 p-3 rounded-md text-right emotion-definition ${
            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            <p className="font-arabic">{definition}</p>
          </div>
        )}
      </div>

      {/* Zone de commentaire */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h3 className={`text-center text-lg mb-4 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          ملاحظات
        </h3>
        <textarea
          placeholder="كيف كان يومك؟ وماهي أهم إنجازاتك اليوم؟"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`w-full p-4 text-right rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-arabic ${
            darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border border-gray-200'
          }`}
        />
      </div>
      
      {/* Styles CSS pour les animations des émotions */}
      <style jsx>{`
        .emotion-selected {
          transform: scale(1.2);
          transition: transform 0.2s ease;
        }
        
        .emotion-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .definition-fade-in {
          animation: fadeIn 0.5s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0.5; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  const renderSpiritualPage = () => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-center text-lg mb-6 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
        التوازن الروحي
      </h3>
      
      {/* Affichage avec structure améliorée et meilleure organisation visuelle */}
      <div className="space-y-6">
        {spiritualCategories.map((group, groupIndex) => (
          <div key={groupIndex} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`text-center text-md mb-4 font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
              {group.group}
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
        ))}
      </div>
    </div>
  );

  const renderPhysicalPage = () => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-center text-lg mb-6 font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
        التوازن النفسي والجسدي
      </h3>
      
      {/* Affichage avec structure améliorée et meilleure organisation visuelle */}
      <div className="space-y-6">
        {physicalMentalCategories.map((group, groupIndex) => (
          <div key={groupIndex} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h4 className={`text-center text-md mb-4 font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
              {group.group}
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
        ))}
      </div>
    </div>
  );

  // Rendu du contenu d'entrée avec swipe
  // Rendu du contenu d'entrée avec swipe
const renderInputContent = () => {
  return (
    <div className="space-y-6 py-4 flex flex-col h-full justify-between">
      {/* Styles CSS inline pour les animations */}
      <style>{slideStyles}</style>
      
      {/* Styles pour les animations de sauvegarde */}
      <style>{`
        .save-button {
          position: relative;
          overflow: hidden;
        }
        
        .save-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.6s;
        }
        
        .save-button.saving::after {
          left: 100%;
        }
        
        @keyframes success-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .save-success {
          animation: success-pulse 0.6s ease-in-out;
        }
      `}</style>
      
      <div className="flex-1 flex flex-col">
        {/* Sélecteur de date */}
        <DateSelector />
        
        {loadingEntry ? (
          <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="font-arabic">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            {/* Navigation à trois onglets */}
            {renderInputTabNavigation()}
            
            {/* Conteneur des pages avec support de swipe */}
            <div 
              ref={inputContainerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="transition-all duration-300 relative flex-1"
            >
              {/* Utilisation de conditions pour afficher les pages et contrôler leur visibilité */}
              <div className={`${activeInputPage === 'emotions' ? 'block' : 'hidden'}`}>
                {renderEmotionsPage()}
              </div>
              
              <div className={`${activeInputPage === 'spiritual' ? 'block' : 'hidden'}`}>
                {renderSpiritualPage()}
              </div>
              
              <div className={`${activeInputPage === 'physical' ? 'block' : 'hidden'}`}>
                {renderPhysicalPage()}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Partie fixe en bas avec les messages et boutons */}
      <div className="pt-4">
        {/* Message de succès ou d'erreur */}
        {successMessage && (
          <div className={`p-3 rounded-md text-center transition-all duration-300 mb-4 ${
            isErrorMessage 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {successMessage}
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button 
            onClick={resetFields}
            className={`flex-1 font-arabic py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            disabled={isSaving}
          >
            إلغاء
          </button>
          <button 
            onClick={handleSave}
            className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center text-white font-arabic save-button ${
              darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
            } ${isSaving ? 'saving' : ''} ${saveAnimation ? 'save-success' : ''}`}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="mr-2" />
                {isEditMode ? 'تحديث' : 'تسجيل'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

  // Rendu du contenu des statistiques
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

  // Rendu du contenu de l'historique
  const renderHistoryContent = () => {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <h3 className="text-xl text-center mb-6 font-bold">سجل الإدخالات</h3>
        
        {/* Calendrier */}
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
        
        {/* Liste des entrées */}
        <div className="space-y-4">
          <h4 className="font-bold text-center mb-4">آخر الإدخالات</h4>
          {entriesLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : entries.length > 0 ? (
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
              disabled={syncing}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg font-arabic ${
                darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'  
              } ${syncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  <span>جاري المزامنة...</span>
                </>
              ) : (
                <>
                  <FaSyncAlt />
                  <span>مزامنة الآن</span>
                </>
              )}
            </button>
          </div>
          
          {canInstall && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-between`}>
              <span className="font-arabic">تثبيت التطبيق</span>
              <button 
                onClick={installPWA}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg font-arabic ${
                  darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-600 text-white hover:bg-green-700'  
                }`}
              >
                <FaDownload />
                <span>تثبيت</span>
              </button>
            </div>
          )}
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} flex items-center justify-between`}>
            <span className="font-arabic">تصدير تقرير PDF</span>
            <button 
              onClick={generatePdfReport}
              disabled={savingPdf}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg font-arabic ${
                darkMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-700'  
              } ${savingPdf ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {savingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <FaFilePdf />
                  <span>تصدير PDF</span>
                </>
              )}
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
            <p className="text-xs text-center opacity-70">v1.1.0</p>
          </div>
        </div>
      </div>
    );
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
  return (
    <div className={`min-h-screen pb-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`py-2 px-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 inline-block text-transparent bg-clip-text">
            LifeSky
          </h1>
          <div className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs font-arabic">{isOnline ? 'متصل' : 'غير متصل'}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-4">
        {renderContent()}
      </main>

      {/* Navigation inférieure */}
      <nav className={`fixed bottom-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-10`}>
        <div className="grid grid-cols-4 items-center">
          <button 
            onClick={() => setActiveSubTab('input')}
            className={`flex flex-col items-center py-3 transition-colors duration-200 ${
              activeSubTab === 'input' 
                ? (darkMode ? 'text-blue-400 border-t-2 border-blue-400' : 'text-blue-600 border-t-2 border-blue-600') 
                : (darkMode ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            <FaCloudUploadAlt size={20} />
            <span className="text-xs mt-1 font-arabic">تسجيل</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('stats')}
            className={`flex flex-col items-center py-3 transition-colors duration-200 ${
              activeSubTab === 'stats' 
                ? (darkMode ? 'text-blue-400 border-t-2 border-blue-400' : 'text-blue-600 border-t-2 border-blue-600') 
                : (darkMode ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            <FaChartBar size={20} />
            <span className="text-xs mt-1 font-arabic">إحصائيات</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('history')}
            className={`flex flex-col items-center py-3 transition-colors duration-200 ${
              activeSubTab === 'history' 
                ? (darkMode ? 'text-blue-400 border-t-2 border-blue-400' : 'text-blue-600 border-t-2 border-blue-600') 
                : (darkMode ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            <FaHistory size={20} />
            <span className="text-xs mt-1 font-arabic">تاريخ</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={`flex flex-col items-center py-3 transition-colors duration-200 ${
              activeSubTab === 'settings' 
                ? (darkMode ? 'text-blue-400 border-t-2 border-blue-400' : 'text-blue-600 border-t-2 border-blue-600') 
                : (darkMode ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            <FaCog size={20} />
            <span className="text-xs mt-1 font-arabic">إعدادات</span>
          </button>
        </div>
      </nav>
      
      {/* Styles CSS globaux pour l'application */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        .font-arabic {
          font-family: 'Tajawal', sans-serif;
        }
        
        /* Styles pour les swipes et les transitions */
        .page-transition {
          transition: all 0.3s ease-in-out;
        }
        
        /* Animation pour les points de chargement */
        @keyframes fadeInOut {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        
        .loading-dots span {
          animation: fadeInOut 1.5s infinite;
          animation-fill-mode: both;
        }
        
        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default LifeSkyApp;