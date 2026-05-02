import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);
  const clean = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^\/+/, '');
  const file = join(root, clean);
  if (!file.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, () => console.log(`Serving http://localhost:${port}`));
