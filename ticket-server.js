/**
 * RYC Tickets — Generic Middleware
 *
 * Drop this into any Node.js project to enable the RYC Tickets Chrome extension
 * to save tickets directly to a tickets/ folder in your project root.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────────
 *
 * Express / Connect:
 *   const { ticketMiddleware } = require('./ticket-server');
 *   app.use(ticketMiddleware());
 *
 * Plain Node http server:
 *   const { ticketHandler } = require('./ticket-server');
 *   const server = http.createServer((req, res) => {
 *     if (ticketHandler(req, res)) return; // handled
 *     // ... your normal handler
 *   });
 *
 * Eleventy (.eleventy.js):
 *   const { ticketMiddleware } = require('./ticket-server');
 *   eleventyConfig.setServerOptions({ middleware: [ticketMiddleware()] });
 *
 * Vite (vite.config.js):
 *   import { ticketMiddleware } from './ticket-server';
 *   export default { server: { middlewareMode: true }, plugins: [{
 *     configureServer(server) { server.middlewares.use(ticketMiddleware()); }
 *   }] };
 *
 * ─── Options ──────────────────────────────────────────────────────────────────
 *
 *   ticketMiddleware({ dir: 'my-tickets' })   — custom folder name (default: 'tickets')
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_DIR = 'tickets';

function getTicketsDir(dir) {
  return path.join(process.cwd(), dir || DEFAULT_DIR);
}

function parseTicket(content) {
  const parts = content.split('---');
  if (parts.length < 3) return null;
  const fm = {};
  parts[1].trim().split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');
    fm[key] = val;
  });
  fm.note = parts.slice(2).join('---').trim();
  return fm;
}

/**
 * Raw handler — returns true if the request was handled, false otherwise.
 * Works with Node's built-in http module.
 */
function ticketHandler(req, res, opts) {
  const dir = getTicketsDir(opts && opts.dir);
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  // GET /annotator/tickets — list all tickets (optionally filter by ?status=open)
  if (req.method === 'GET' && pathname === '/annotator/tickets') {
    fs.mkdirSync(dir, { recursive: true });
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const statusFilter = url.searchParams.get('status');
    const tickets = files.map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      return parseTicket(content);
    }).filter(Boolean);
    const result = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return true;
  }

  // POST /annotator/ticket — save a new ticket as .md file
  if (req.method === 'POST' && pathname === '/annotator/ticket') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const id = data.id || `ticket-${Date.now()}`;
        const mdLines = [
          '---',
          `id: ${id}`,
          `page: ${data.page || '/'}`,
          `element: ${data.element || 'unknown'}`,
        ];
        if (data.path) mdLines.push(`path: "${data.path}"`);
        if (data.css) mdLines.push(`css: "${data.css}"`);
        mdLines.push(
          `text: "${(data.text || '').replace(/"/g, '\\"')}"`,
          `status: ${data.status || 'open'}`,
          '---',
          '',
          data.note || '',
        );
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${id}.md`), mdLines.join('\n'), 'utf8');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return true;
  }

  // PATCH /annotator/ticket/:id — update a ticket's note
  if (req.method === 'PATCH' && pathname.startsWith('/annotator/ticket/')) {
    const id = pathname.split('/').pop();
    const file = path.join(dir, `${id}.md`);
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end('{}');
      return true;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const content = fs.readFileSync(file, 'utf8');
        const parts = content.split('---');
        fs.writeFileSync(file, '---' + parts[1] + '---\n\n' + (data.note || '') + '\n', 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end('{}');
      }
    });
    return true;
  }

  return false;
}

/**
 * Connect/Express-style middleware.
 */
function ticketMiddleware(opts) {
  return function (req, res, next) {
    if (!ticketHandler(req, res, opts)) {
      next();
    }
  };
}

module.exports = { ticketHandler, ticketMiddleware };
