// PROXY KING FF - servidor de sessão (porta 1900)
// Uso: node server.js   (sem dependências, precisa do Node 14+)
const http = require('http');
const fs = require('fs');
const path = require('path');

// Lê a porta do localconfig.json (mesmo formato: {"verAddr":"http://IP:1900/"})
let PORT = 1900;
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'localconfig.json'), 'utf8'));
  PORT = Number(new URL(cfg.verAddr).port) || 1900;
} catch (e) { /* usa 1900 */ }

const session = { active: false, since: null };

// Pontos de extensão: coloque aqui o que deve rodar ao ativar/desativar.
function onActivate()   { console.log('[ATIVAR]    sessão iniciada'); }
function onDeactivate() { console.log('[DESATIVAR] sessão encerrada'); }

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && (url === '/' || url === '/status')) {
    return send(res, 200, { ok: true, status: session.active ? 'online' : 'offline', since: session.since });
  }
  if (req.method === 'POST' && url === '/activate') {
    if (!session.active) { session.active = true; session.since = new Date().toISOString(); onActivate(); }
    return send(res, 200, { ok: true, status: 'online' });
  }
  if (req.method === 'POST' && url === '/deactivate') {
    if (session.active) { session.active = false; session.since = null; onDeactivate(); }
    return send(res, 200, { ok: true, status: 'offline' });
  }
  send(res, 404, { ok: false, error: 'rota não encontrada' });
}).listen(PORT, '0.0.0.0', () => console.log('Servidor ouvindo na porta ' + PORT));
