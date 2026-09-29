import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served by GitHub Pages at https://frictionlesscode.github.io/ncmathssa/
  base: '/ncmathssa/',
  plugins: [react(), tailwindcss()],
})

