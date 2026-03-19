import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const TICKETS_DIR = path.join(process.cwd(), 'tickets')

function pad(n) { return String(n).padStart(2, '0') }

function makeId() {
  const d = new Date()
  return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate()),
    pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()), d.getMilliseconds()].join('-')
}

function parseTicket(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const parts = content.split('---')
  if (parts.length < 3) return null
  const fm = {}
  parts[1].trim().split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^"|"$/g, '')
  })
  fm.note = parts.slice(2).join('---').trim()
  fm.id = path.basename(filePath, '.md')
  return fm
}

function writeTicket(id, data) {
  fs.mkdirSync(TICKETS_DIR, { recursive: true })
  const lines = [
    '---',
    `id: ${id}`,
    `page: ${data.page || '/'}`,
    `element: ${data.element || ''}`,
    data.path  ? `path: "${data.path}"`  : null,
    data.css   ? `css: "${data.css}"`    : null,
    `text: "${(data.text || '').replace(/"/g, '\\"')}"`,
    `status: ${data.status || 'open'}`,
    '---',
    '',
    data.note || '',
  ].filter(v => v !== null).join('\n')
  fs.writeFileSync(path.join(TICKETS_DIR, `${id}.md`), lines, 'utf8')
}

function ticketsMiddleware(req, res, next) {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  // GET /annotator/tickets — list open tickets
  if (req.method === 'GET' && p === '/annotator/tickets') {
    fs.mkdirSync(TICKETS_DIR, { recursive: true })
    const tickets = fs.readdirSync(TICKETS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => parseTicket(path.join(TICKETS_DIR, f)))
      .filter(Boolean)
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(tickets))
    return
  }

  // POST /annotator/ticket — create ticket
  if (req.method === 'POST' && p === '/annotator/ticket') {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const id = makeId()
        writeTicket(id, data)
        res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
        res.end(JSON.stringify({ id }))
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  // PATCH /annotator/ticket/:id — update note or status
  if (req.method === 'PATCH' && p.startsWith('/annotator/ticket/')) {
    const id = p.split('/').pop()
    const file = path.join(TICKETS_DIR, `${id}.md`)
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('{}'); return }
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      try {
        const updates = JSON.parse(body)
        const ticket = parseTicket(file)
        writeTicket(id, { ...ticket, ...updates })
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  // DELETE /annotator/tickets — clear all
  if (req.method === 'DELETE' && p === '/annotator/tickets') {
    if (fs.existsSync(TICKETS_DIR)) {
      fs.readdirSync(TICKETS_DIR).filter(f => f.endsWith('.md'))
        .forEach(f => fs.unlinkSync(path.join(TICKETS_DIR, f)))
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  next()
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // RYC Tickets — dev only, never in production build
    command === 'serve' && {
      name: 'ryc-tickets',
      configureServer(server) {
        server.middlewares.use(ticketsMiddleware)
      },
      transformIndexHtml: (html) =>
        html.replace('</body>', '<script src="/ryc-annotator.js"></script></body>'),
    },
  ],
}))
