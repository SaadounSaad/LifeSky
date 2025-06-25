// DataSyncContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const DataSyncContext = createContext();

export const DataSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialisation de Supabase
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Synchronisation des données
  const syncData = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      // Récupérer les entrées locales non synchronisées
      const localEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      
      // Filtrer les entrées qui n'ont pas encore été synchronisées
      const unsyncedEntries = localEntries.filter(entry => !entry.synced);

      if (unsyncedEntries.length > 0) {
        // Synchroniser chaque entrée
        for (const entry of unsyncedEntries) {
          const { data, error } = await supabase
            .from('mood_entries')
            .insert([{
              ...entry,
              synced: true
            }]);

          if (error) {
            console.error('Erreur de synchronisation:', error);
          }
        }

        // Mettre à jour les entrées locales
        const updatedEntries = localEntries.map(entry => ({
          ...entry,
          synced: true
        }));

        localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
      }
    } catch (error) {
      console.error('Erreur de synchronisation globale:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Écoute des événements en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <DataSyncContext.Provider value={{ 
      isOnline, 
      isSyncing, 
      syncData 
    }}>
      {children}
    </DataSyncContext.Provider>
  );
};

// Hook personnalisé pour utiliser la synchronisation
export const useDataSync = () => useContext(DataSyncContext);