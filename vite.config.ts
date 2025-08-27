import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
     tailwindcss()
  ],
  base: "/online_tutoring_dev",
  server: {
    host: '0.0.0.0',   // listen on all addresses
    port: 5173,        // or your custom port
  },
})