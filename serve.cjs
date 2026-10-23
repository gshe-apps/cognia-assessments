const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'project');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname.startsWith('/_blob/')) {
    res.writeHead(200, {'Content-Type':'image/svg+xml'});
    const logo = pathname.endsWith('03b113a3dc2e610eb61ccc911bd46d5e');
    if (logo) return res.end(fs.readFileSync(path.join(root, 'assets/cognia-logo.svg')));
    return res.end(logo ? '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><text x="0" y="30" font-family="Arial" font-size="32" fill="white">cognia</text></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="170"><rect width="400" height="170" fill="#eee9f0"/><text x="200" y="85" text-anchor="middle" font-family="Arial" fill="#66596b">Image unavailable in export</text></svg>');
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/Main.dc.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (error, data) => {
    res.writeHead(error ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
    res.end(error ? 'Not found' : data);
  });
}).listen(4174, '127.0.0.1', () => console.log('Cognia preview: http://localhost:4174'));
