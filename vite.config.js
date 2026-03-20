import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'serve' && {
      name: 'ryc-tickets',
      configureServer(server) {
        const { ticketMiddleware } = require('./ticket-server')
        server.middlewares.use(ticketMiddleware())
      },
    },
  ],
}))
