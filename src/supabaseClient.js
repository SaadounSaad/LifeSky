import { createClient } from '@supabase/supabase-js';

// Remplacez par vos propres valeurs depuis Supabase > Settings > API
const supabaseUrl = 'https://eatwkbsvvhazrtfrkzum.supabase.co';  // URL de votre projet Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdHdrYnN2dmhhenJ0ZnJrenVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3ODcxOTMsImV4cCI6MjA1NTM2MzE5M30.z1pXBpTw_1i7ITWi31Z_iInQJ8GYXLz-LgNJPUnVwpo';  // Clé API publique (anon key)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
