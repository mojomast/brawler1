import { access, readdir, readFile } from 'node:fs/promises';

const required = ['index.html', 'src/main.js', 'src/game/scenes/GameScene.js', 'devplan/current-phase.md'];
await Promise.all(required.map((path) => access(path)));
const html = await readFile('index.html', 'utf8');
if (!html.includes('type="module"') || !html.includes('/src/main.js')) throw new Error('index.html missing module entry');
const srcFiles = await readdir('src/game', { recursive: true });
if (srcFiles.length < 8) throw new Error('Expected modular game source files');
console.log('Build check passed');
