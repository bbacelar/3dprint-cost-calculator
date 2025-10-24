import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Altere o valor de base para corresponder ao nome do repositório GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/3dprint-cost-calculator/'
})