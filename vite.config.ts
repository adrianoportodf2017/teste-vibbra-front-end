import { defineConfig } from 'vite'
 import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Especificar explicitamente se necessário
      config: './tailwind.config.js'
    }),  ],
})