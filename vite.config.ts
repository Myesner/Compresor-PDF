import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En build (GitHub Pages) el sitio vive bajo /Compresor-PDF/;
  // en dev se sirve en la raíz de localhost:3000 como siempre.
  base: command === 'build' ? '/Compresor-PDF/' : '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
