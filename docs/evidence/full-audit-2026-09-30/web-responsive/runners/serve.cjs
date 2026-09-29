// Minimal static server for storybook-static on 6026. python http.server reset connections under
// parallel Playwright load (ERR_CONNECTION_RESET on dynamic imports), so the audit uses this instead.
const http = require('http'), fs = require('fs'), path = require('path');
const root = '/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/storybook-static';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp', '.ico': 'image/x-icon', '.map': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(buf); });
}).listen(6026, '127.0.0.1');
