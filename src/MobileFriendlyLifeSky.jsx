import React, { useState, useEffect } from 'react';
import { 
  FaBars, FaTimes, FaStar, FaCloudUploadAlt, 
  FaMoon, FaSun, FaChartBar, FaHistory, FaCog 
} from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const MobileFriendlyLifeSky = () => {
  // États principaux
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [activeView, setActiveView] = useState('input');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // États de saisie
  const [currentStep, setCurrentStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [spiritualRatings, setSpiritualRatings] = useState({});
  const [physicalRatings, setPhysicalRatings] = useState({});

  // Configuration Supabase
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Effets secondaires pour le mode sombre
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Liste des émotions
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

  // Catégories de notation
  const spiritualCategories = [
    { key: 'prayer', label: 'الصلاة', icon: '/icons/prayer.png' },
    { key: 'quran', label: 'القرآن', icon: '/icons/quran.png' },
    { key: 'meditation', label: 'التأمل', icon: '/icons/meditation.png' },
    { key: 'charity', label: 'الصدقة', icon: '/icons/charity.png' }
  ];

  const physicalCategories = [
    { key: 'exercise', label: 'الرياضة', icon: '/icons/exercise.png' },
    { key: 'sleep', label: 'النوم', icon: '/icons/sleep.png' },
    { key: 'nutrition', label: 'التغذية', icon: '/icons/nutrition.png' },
    { key: 'water', label: 'الماء', icon: '/icons/water.png' }
  ];

  // Gestion des notes par étoiles
  const StarRating = ({ value, onChange, label }) => {
    return (
      <div className="star-item">
        <div className="icon-label">
          <img src="/icons/star.png" alt="Star" className="rating-icon" />
          <span>{label}</span>
        </div>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`star ${star <= value ? 'active' : ''}`}
              onClick={() => onChange(star)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Sauvegarde des données
  const handleSave = async () => {
    const entryData = {
      mood,
      note: note.trim() || 'لا توجد ملاحظات',
      spiritualRatings,
      physicalRatings,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // Sauvegarde locale
      const localEntries = JSON.parse(localStorage.getItem('entries') || '[]');
      localEntries.unshift(entryData);
      localStorage.setItem('entries', JSON.stringify(localEntries));

      // Sauvegarde en ligne si possible
      if (navigator.onLine) {
        await supabase.from('entries').insert([entryData]);
      }

      // Réinitialisation
      setMood(null);
      setNote('');
      setSpiritualRatings({});
      setPhysicalRatings({});
      setCurrentStep(1);
      setActiveView('stats');
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // Composant du menu latéral
  const SideMenu = () => (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">القائمة</h2>
        <button onClick={() => setIsSideMenuOpen(false)} className="btn">
          <FaTimes />
        </button>
      </div>
      <nav className="mt-8 space-y-4 px-4">
        {[
          { name: 'التسجيل', icon: FaCloudUploadAlt, view: 'input' },
          { name: 'الإحصائيات', icon: FaChartBar, view: 'stats' },
          { name: 'السجل', icon: FaHistory, view: 'history' },
          { name: 'الإعدادات', icon: FaCog, view: 'settings' }
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveView(item.view);
              setIsSideMenuOpen(false);
            }}
            className="btn btn-secondary w-full text-right flex items-center gap-3"
          >
            <item.icon />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  // Étapes du formulaire
  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-center text-xl mb-6">اختر مشاعرك</h2>
            <div className="emotion-grid">
              {emotions.map((emotion) => (
                <div 
                  key={emotion.name}
                  className={`emotion-item ${mood === emotion.name ? 'selected' : ''}`}
                  onClick={() => setMood(emotion.name)}
                >
                  <img 
                    src={`/icons/${emotion.file}`} 
                    alt={emotion.name} 
                  />
                  <span>{emotion.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-center text-xl mb-6">التوازن الروحي</h2>
            <div className="star-sliders">
              {spiritualCategories.map((category) => (
                <StarRating
                  key={category.key}
                  label={category.label}
                  value={spiritualRatings[category.key] || 0}
                  onChange={(value) => setSpiritualRatings(prev => ({
                    ...prev,
                    [category.key]: value
                  }))}
                />
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-center text-xl mb-6">التوازن الجسدي</h2>
            <div className="star-sliders">
              {physicalCategories.map((category) => (
                <StarRating
                  key={category.key}
                  label={category.label}
                  value={physicalRatings[category.key] || 0}
                  onChange={(value) => setPhysicalRatings(prev => ({
                    ...prev,
                    [category.key]: value
                  }))}
                />
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-center text-xl mb-6">ملاحظاتك</h2>
            <textarea
              className="text-input"
              placeholder="اكتب ملاحظاتك هنا..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Navigation entre les étapes
  const StepNavigation = () => (
    <div className="flex justify-between mt-6 px-4">
      {currentStep > 1 && (
        <button 
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="btn btn-secondary"
        >
          السابق
        </button>
      )}
      
      {currentStep < 4 && (
        <button 
          onClick={() => setCurrentStep(prev => prev + 1)}
          className="btn btn-primary"
          disabled={
            (currentStep === 1 && !mood) || 
            (currentStep === 2 && Object.keys(spiritualRatings).length === 0) ||
            (currentStep === 3 && Object.keys(physicalRatings).length === 0)
          }
        >
          التالي
        </button>
      )}
      
      {currentStep === 4 && (
        <button 
          onClick={handleSave}
          className="btn btn-primary"
          disabled={!note.trim()}
        >
          حفظ
        </button>
      )}
    </div>
  );

  // Indicateurs d'étape
  const StepIndicators = () => (
    <div className="form-steps">
      {[1, 2, 3, 4].map((step) => (
        <div 
          key={step}
          className={`step-indicator ${currentStep === step ? 'active' : ''}`}
        />
      ))}
    </div>
  );

  // Rendu principal
  return (
    <div className="min-h-screen">
      {/* Barre de navigation supérieure */}
      <header className="flex justify-between items-center p-4 border-b">
        <button onClick={() => setIsSideMenuOpen(true)} className="btn">
          <FaBars />
        </button>
        <h1>LifeSky</h1>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="btn"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* Contenu principal */}
      <main className="p-4">
        {activeView === 'input' && (
          <div>
            {renderFormStep()}
            <StepNavigation />
            <StepIndicators />
          </div>
        )}
        
        {/* Autres vues à implémenter */}
        {activeView === 'stats' && <div>الإحصائيات</div>}
        {activeView === 'history' && <div>السجل</div>}
        {activeView === 'settings' && <div>الإعدادات</div>}
      </main>

      {/* Menu latéral */}
      {isSideMenuOpen && <SideMenu />}
    </div>
  );
};

export default MobileFriendlyLifeSky;