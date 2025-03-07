import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseTest = () => {
  const [status, setStatus] = useState('En attente...');
  const [testEntry, setTestEntry] = useState(null);

  useEffect(() => {
    console.log('Composant monté');
    console.log('URL Supabase:', import.meta.env.VITE_SUPABASE_URL);
    
    // Vérifie si les variables d'environnement sont chargées
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setStatus('Erreur: Variables d\'environnement manquantes');
      return;
    }

    // Initialisation du client Supabase
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const testConnection = async () => {
      console.log('Test de connexion démarré');
      try {
        // Test simple pour vérifier la connexion
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .limit(1);

        if (error) throw error;

        console.log('Réponse reçue:', data);
        setStatus('Connexion réussie ! ✅');
        setTestEntry(data[0]);

      } catch (error) {
        console.error('Erreur de test:', error);
        setStatus(`Erreur de connexion: ${error.message} ❌`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-xl font-bold mb-4">Test de connexion Supabase</h2>
      
      <div className="space-y-4">
        <div className="p-3 bg-gray-100 rounded">
          <p className="font-medium">Statut:</p>
          <p className={`${status.includes('réussie') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        </div>

        {testEntry && (
          <div className="p-3 bg-gray-100 rounded">
            <p className="font-medium">Données de test:</p>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(testEntry, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest;