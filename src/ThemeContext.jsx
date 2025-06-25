//ThemeContext.jsx
// ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Charger le mode sombre depuis le localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    // Sauvegarder le mode sombre dans le localStorage
    localStorage.setItem('darkMode', darkMode.toString());
    
    // Appliquer la classe au body pour les styles globaux
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);