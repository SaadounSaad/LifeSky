import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Charge les variables d'environnement

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // ✅ Simplifie les imports
    },
  },
  esbuild: {
    loader: "jsx", // ✅ Force le support JSX
  },
  build: {
    outDir: 'dist', // 📁 Dossier de sortie du build
    rollupOptions: {
      input: '/index.html', // ✅ Indique le point d'entrée
    },
  },
});
