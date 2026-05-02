import { readFile } from 'node:fs/promises';

const files = ['src/game/entities/Player.js', 'src/game/entities/ProtagonistArt.js', 'src/game/entities/Enemy.js', 'src/game/ai/WaveDirector.js', 'src/game/ui/Hud.js'];
const text = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
for (const token of ['light', 'heavy', 'special', 'hitstun', 'defeated', 'wave', 'klek', 'bossTypes', 'stages']) {
  if (!text.includes(token)) throw new Error(`Smoke check missing ${token}`);
}
console.log('Smoke test passed');
