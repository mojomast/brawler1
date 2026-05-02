const PALETTE = {
  ink: '#111018',
  stageBlack: '#050505',
  paper: '#f6e6b8',
  paperShade: '#e8e1cf',
  tape: '#d8d2bf',
  seam: '#cfc6ad',
  cardboard: '#8a4f2a',
  bruise: '#4b2e83',
  green: '#a4c639',
  yellow: '#ffd447',
  pink: '#ff5ca8',
  blue: '#1c355e'
};

export function drawProtagonist(ctx, player, time) {
  const bob = player.state === 'run' ? Math.sin(time / 80) * 3 : 0;
  ctx.save();
  ctx.translate(player.x, player.y - player.z + bob);
  ctx.scale(player.facing, 1);
  ctx.globalAlpha = player.invuln > 0 && Math.floor(player.invuln * 20) % 2 ? 0.45 : 1;
  drawStageShadow(ctx);
  if (player.config.id === 'klek') drawKlek(ctx, time, player.attack);
  else drawKhn(ctx, time, player.attack);
  drawAttackDebug(ctx, player.attack);
  ctx.restore();
}

function drawAttackDebug(ctx, attack) {
  if (!attack) return;
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = attack.kind === 'special' ? PALETTE.green : attack.kind === 'heavy' ? PALETTE.yellow : PALETTE.pink;
  ctx.fillRect(28, -attack.height - 20, attack.width, attack.height);
  ctx.globalAlpha = 1;
}

function drawStageShadow(ctx) {
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 14, 38, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawKhn(ctx, time, attack) {
  const attacking = Boolean(attack);
  // Khn: wiry string-player silhouette, full dot suit, toe-loop module, long-nosed papier-mache head.
  drawKhnBody(ctx, time, attacking);
  drawKhnGuitar(ctx, time, attacking);
  drawKhnMask(ctx, time, attacking);
  if (attacking) drawActionGlyphs(ctx, 'microtone');
}

function drawKhnBody(ctx, time, attacking) {
  const lean = attacking ? -0.2 : -0.08;
  const sway = Math.sin(time / 180) * 1.5;
  ctx.save(); ctx.translate(0, sway - 8); ctx.rotate(lean);
  ctx.fillStyle = PALETTE.stageBlack;
  ctx.beginPath(); ctx.moveTo(-11, -34); ctx.lineTo(11, -33); ctx.lineTo(15, 12); ctx.lineTo(6, 25); ctx.lineTo(-8, 24); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fill();
  ctx.fillRect(-11, 18, 7, 30); ctx.fillRect(4, 17, 7, 31);
  drawKhnFoot(ctx, -13, 48, -0.08); drawKhnFoot(ctx, 14, 48, 0.08);
  drawDotBand(ctx, -9, -27, 4, 3, 8, 'vertical');
  drawDotBand(ctx, 5, -29, 3, 3, 8, 'vertical');
  drawDotBand(ctx, -12, 22, 2, 4, 7, 'vertical');
  drawDotBand(ctx, 5, 21, 2, 4, 7, 'vertical');
  drawDotBand(ctx, -24, -5, 2, 3, 7, 'diagonal');
  drawDotBand(ctx, 16, -10, 2, 3, 7, 'diagonal');
  ctx.strokeStyle = PALETTE.tape; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -28); ctx.lineTo(13, -24); ctx.stroke();
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(-26, -7); ctx.lineTo(-19, 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(24, -8); ctx.lineTo(18, 9); ctx.stroke();
  ctx.restore();
}

function drawKhnGuitar(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -9); ctx.rotate(attacking ? -0.34 : Math.sin(time / 250) * 0.04);
  ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(78, -55); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-18, -7); ctx.lineTo(60, -20); ctx.stroke();
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(78, -55); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -7); ctx.lineTo(60, -20); ctx.stroke();
  ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) { const x = -10 + i * 5 + (i % 4 === 0 ? 1.5 : 0); const y = -20 - i * 2.05; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y + 5); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const x = -9 + i * 5.5 + (i % 3 === 1 ? 1 : 0); const y = -10 - i * 0.9; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 2, y + 4); ctx.stroke(); }
  ctx.fillStyle = PALETTE.stageBlack; ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-39, -18); ctx.lineTo(-13, -28); ctx.lineTo(2, -3); ctx.lineTo(-18, 18); ctx.lineTo(-43, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PALETTE.paper; ctx.fillRect(-27, -11, 10, 3); ctx.fillRect(-26, -3, 12, 2);
  if (attacking) { ctx.globalAlpha = 0.55; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-30, -24); ctx.quadraticCurveTo(8, -52, 66, -62); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, 8); ctx.quadraticCurveTo(10, -18, 68, -31); ctx.stroke(); }
  ctx.restore();
  drawKhnLoopModule(ctx, attacking);
}

function drawKhnMask(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -74 + Math.sin(time / 190) * 1.2); ctx.rotate(attacking ? -0.09 : Math.sin(time / 320) * 0.03);
  ctx.fillStyle = PALETTE.paperShade; ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-30, -38); ctx.quadraticCurveTo(8, -55, 34, -22); ctx.quadraticCurveTo(49, -10, 38, 11); ctx.quadraticCurveTo(24, 38, -13, 43); ctx.quadraticCurveTo(-47, 30, -43, -8); ctx.quadraticCurveTo(-50, -31, -30, -38); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(31, -21); ctx.quadraticCurveTo(73, -18, 94, -3); ctx.quadraticCurveTo(72, 8, 33, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 84, 82, 3);
  drawPaperSeams(ctx);
  drawMaskDots(ctx, [-21, -25, -6, -31, 16, -26, -31, -5, 18, 13, -14, 25]);
  ctx.fillStyle = PALETTE.stageBlack; ctx.fillRect(-14, -13, 14, 4); ctx.fillRect(10, -10, 10, 3); ctx.fillRect(-7, 15, 16, 3);
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.quadraticCurveTo(2, -8, -2, 28); ctx.stroke();
  ctx.restore();
}

function drawKlek(ctx, time, attack) {
  const attacking = Boolean(attack);
  // Klek: grounded percussion silhouette, full dot suit, boulder mask, compact busy kit.
  drawKlekBody(ctx, time, attacking);
  drawKlekPercussion(ctx, time, attacking);
  drawKlekMask(ctx, time, attacking);
  if (attacking) drawActionGlyphs(ctx, 'percussion');
}

function drawKlekBody(ctx, time, attacking) {
  const stomp = attacking ? 3 : Math.abs(Math.sin(time / 150)) * 1.4;
  ctx.save(); ctx.translate(0, stomp - 8); ctx.fillStyle = PALETTE.stageBlack;
  ctx.beginPath(); ctx.moveTo(-17, -31); ctx.lineTo(17, -31); ctx.lineTo(21, 8); ctx.lineTo(12, 25); ctx.lineTo(-13, 25); ctx.lineTo(-22, 8); ctx.closePath(); ctx.fill();
  ctx.fillRect(-17, 17, 9, 31); ctx.fillRect(8, 17, 9, 31); drawKlekBoot(ctx, -16, 48, -0.03); drawKlekBoot(ctx, 17, 48, 0.03);
  drawDotBand(ctx, -14, -20, 3, 3, 9, 'diagonal');
  drawDotBand(ctx, 9, -23, 3, 3, 9, 'diagonalBack');
  drawDotBand(ctx, -17, 20, 2, 4, 8, 'vertical');
  drawDotBand(ctx, 8, 20, 2, 4, 8, 'vertical');
  drawDotBand(ctx, -28, -7, 2, 3, 7, 'diagonalBack');
  drawDotBand(ctx, 22, -7, 2, 3, 7, 'diagonal');
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-17, -27); ctx.lineTo(15, 23); ctx.moveTo(17, -27); ctx.lineTo(-14, 23); ctx.stroke();
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 8; ctx.lineCap = 'round'; const lift = attacking ? -12 : 0;
  ctx.beginPath(); ctx.moveTo(-14, -23); ctx.lineTo(-31, -10 + lift); ctx.lineTo(-23, 8 + lift); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -23); ctx.lineTo(32, -12 - lift); ctx.lineTo(25, 8 - lift); ctx.stroke();
  ctx.restore();
}

function drawKlekPercussion(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -7); ctx.fillStyle = PALETTE.stageBlack; ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(-30, 31, 34, 14, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(10, 21, 22, 9, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#34302b'; ctx.fillRect(27, -1, 28, 59); ctx.strokeRect(27, -1, 28, 59);
  ctx.fillStyle = '#272522'; ctx.beginPath(); ctx.ellipse(50, 36, 20, 10, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PALETTE.cardboard; ctx.beginPath(); ctx.moveTo(60, 36); ctx.lineTo(86, -12); ctx.lineTo(112, 36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-56, -16); ctx.lineTo(-56, 6); ctx.stroke(); ctx.fillStyle = '#8a7a58'; ctx.beginPath(); ctx.ellipse(-56, 8, 26, 6, -0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.paper; ctx.beginPath(); ctx.moveTo(3, -14); ctx.lineTo(20, -14); ctx.lineTo(11, 2); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-42, -3); ctx.lineTo(-72, 54); ctx.lineTo(-38, 80); ctx.stroke(); ctx.fillStyle = '#3a352d'; ctx.fillRect(-86, 16, 27, 48);
  ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-25, attacking ? -24 : -9); ctx.lineTo(-5, 20); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = '#6a4b34'; ctx.beginPath(); ctx.moveTo(26, attacking ? -42 : -10); ctx.lineTo(66, 12); ctx.stroke(); ctx.fillStyle = '#2d2925'; ctx.beginPath(); ctx.ellipse(70, attacking ? -46 : 10, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  if (attacking) { drawPercussionShock(ctx); }
  ctx.restore();
}

function drawKlekMask(ctx, time, attacking) {
  ctx.save(); ctx.translate(attacking ? Math.sin(time / 12) * 2 : 0, -74); ctx.rotate(attacking ? Math.sin(time / 16) * 0.08 : 0);
  ctx.fillStyle = PALETTE.paperShade; ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-50, -29); ctx.lineTo(-14, -53); ctx.lineTo(44, -40); ctx.quadraticCurveTo(62, -18, 52, 14); ctx.quadraticCurveTo(13, 50, -40, 31); ctx.quadraticCurveTo(-63, -2, -50, -29); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(41, -18); ctx.quadraticCurveTo(78, -12, 96, 2); ctx.quadraticCurveTo(75, 13, 43, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 104, 90, 9);
  drawPaperSeams(ctx);
  drawMaskDots(ctx, [-34, -19, -10, -34, 23, -26, -43, 5, 31, 15, -18, 28]);
  ctx.strokeStyle = 'rgba(55,42,32,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -51); ctx.lineTo(-2, 38); ctx.stroke();
  ctx.fillStyle = PALETTE.stageBlack; ctx.beginPath(); ctx.ellipse(-24, -14, 8, 4, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(23, -5, 6, 3, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-25, 17, 43, 5); ctx.fillStyle = PALETTE.tape; ctx.fillRect(-6, 16, 7, 2); ctx.fillRect(9, 20, 8, 2);
  ctx.restore();
}

function drawKhnLoopModule(ctx, attacking) {
  ctx.save(); ctx.fillStyle = '#2a2723'; ctx.fillRect(-48, 55, 64, 24); ctx.strokeStyle = '#8f7a55'; ctx.strokeRect(-48, 55, 64, 24);
  ctx.fillStyle = '#87ff6a'; ctx.fillRect(-38, 63, 5, 5); ctx.fillStyle = '#49b4ff'; ctx.fillRect(-26, 63, 5, 5);
  ctx.strokeStyle = '#8f7a55'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 55); ctx.bezierCurveTo(10, 28, 24, 18, 38, 8); ctx.stroke();
  if (attacking) { ctx.strokeStyle = '#87ff6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-44, 51); ctx.lineTo(-31, 39); ctx.lineTo(-18, 55); ctx.lineTo(-4, 37); ctx.lineTo(12, 53); ctx.stroke(); }
  ctx.restore();
}

function drawKhnFoot(ctx, x, y, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = PALETTE.stageBlack; ctx.beginPath(); ctx.ellipse(0, 0, 17, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PALETTE.paper; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(9 + i * 4, -3 + (i % 2), 3, 4, 0.2, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
}

function drawKlekBoot(ctx, x, y, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = PALETTE.stageBlack; ctx.fillRect(-18, -6, 36, 12); drawCostumeDots(ctx, [-8, -1, 5, 2, 16, -2]); ctx.restore();
}

function drawCostumeDots(ctx, coords) {
  ctx.fillStyle = PALETTE.paper;
  for (let i = 0; i < coords.length; i += 2) { ctx.beginPath(); ctx.arc(coords[i], coords[i + 1], 3, 0, Math.PI * 2); ctx.fill(); }
}

function drawDotBand(ctx, x, y, cols, rows, spacing, mode) {
  const coords = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const slant = mode === 'diagonal' ? row * 3 : mode === 'diagonalBack' ? -row * 3 : 0;
    coords.push(x + col * spacing + slant, y + row * spacing);
  }
  drawCostumeDots(ctx, coords);
}

function drawMaskDots(ctx, coords) {
  ctx.save(); ctx.globalAlpha = 0.7; drawCostumeDots(ctx, coords); ctx.restore();
}

function drawPercussionShock(ctx) {
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) ctx.strokeRect(-64 - i * 7, 12 - i * 7, 84 + i * 14, 32 + i * 14);
  for (let i = 0; i < 5; i++) {
    const x = 72 + i * 10; const y = 5 - i * 4;
    ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y + 7); ctx.lineTo(x - 7, y + 7); ctx.closePath(); ctx.stroke();
  }
}

function drawPaperSeams(ctx) {
  ctx.strokeStyle = PALETTE.seam; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, -15); ctx.quadraticCurveTo(-3, -23, 15, -17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-17, 15); ctx.quadraticCurveTo(0, 23, 18, 13); ctx.stroke();
}

function drawPaperMacheTexture(ctx, x, y, w, h, seed) {
  ctx.save(); ctx.globalAlpha = 0.2;
  for (let i = 0; i < 14; i++) {
    const px = x + ((i * 37 + seed * 11) % w) - w / 2;
    const py = y + ((i * 19 + seed * 23) % h) - h / 2;
    ctx.fillStyle = i % 2 ? '#ead9b8' : '#9f7f5e'; ctx.beginPath(); ctx.ellipse(px, py, 8 + (i % 4) * 3, 3 + (i % 3) * 2, i * 0.41, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawActionGlyphs(ctx, type) {
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.75;
  if (type === 'microtone') for (let i = 0; i < 7; i++) { const x = 28 + i * 6; const y = -50 + Math.sin(i) * 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y - 12); ctx.stroke(); }
  else for (let i = 0; i < 10; i++) { const a = (Math.PI * 2 * i) / 10; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, 18 + Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 43, 18 + Math.sin(a) * 18); ctx.stroke(); }
  ctx.restore();
}
