import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Inject RYC Tickets annotator in dev only — never included in production build
    command === 'serve' && {
      name: 'ryc-tickets',
      transformIndexHtml: (html) =>
        html.replace('</body>', '<script src="/ryc-annotator.js"></script></body>'),
    },
  ],
}))
