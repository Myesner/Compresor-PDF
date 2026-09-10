import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  // Base del sitio en GitHub Pages: https://myesner.github.io/Compresor-PDF/
  // Para desarrollo local Vite ignora el base siempre que sea una ruta absoluta.
  base: '/Compresor-PDF/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
