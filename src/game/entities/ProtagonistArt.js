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

const DEBUG_ATTACK = false;

export function drawProtagonist(ctx, player, time) {
  const state = {
    isRunning: player.state === 'run',
    isAirborne: player.z > 0,
    isAttacking: Boolean(player.attack),
    attackKind: player.attack?.kind || 'idle',
    attackPhase: player.attackPhase || 0,
    attackPhaseLabel: player.attackPhaseLabel || 'idle'
  };
  const bob = state.isRunning ? Math.sin(time / 72) * 4 : state.isAirborne ? -2 : 0;
  ctx.save();
  ctx.translate(player.x, player.y - player.z + bob);
  ctx.scale(player.facing, 1);
  ctx.globalAlpha = player.invuln > 0 && Math.floor(player.invuln * 20) % 2 ? 0.45 : 1;
  drawStageShadow(ctx);
  if (player.config.id === 'klek') drawKlek(ctx, time, state);
  else drawKhn(ctx, time, state);
  drawAttackDebug(ctx, player.attack);
  ctx.restore();
}

function drawAttackDebug(ctx, attack) {
  if (!DEBUG_ATTACK || !attack) return;
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = attack.kind === 'special' ? PALETTE.green : attack.kind === 'heavy' ? PALETTE.yellow : PALETTE.pink;
  ctx.lineWidth = 1;
  ctx.strokeRect(28, -attack.height - 20, attack.width, attack.height);
  ctx.globalAlpha = 1;
}

function drawStageShadow(ctx) {
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 14, 38, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawKhn(ctx, time, state) {
  // Khn: wiry string-player silhouette, full dot suit, toe-loop module, long-nosed papier-mache head.
  drawKhnBody(ctx, time, state);
  drawKhnGuitar(ctx, time, state);
  drawKhnMask(ctx, time, state);
  if (state.isAttacking) drawActionGlyphs(ctx, 'microtone', state);
}

function drawKhnBody(ctx, time, state) {
  const lean = state.attackPhaseLabel === 'startup' ? 0.13 : state.attackPhaseLabel === 'active' ? -0.35 : state.attackPhaseLabel === 'recovery' ? -0.04 : state.isRunning ? -0.16 : -0.08;
  const sway = Math.sin(time / (state.isRunning ? 95 : 180)) * (state.isRunning ? 2.4 : 1.2);
  const airLift = state.isAirborne ? -4 : 0;
  const recoil = state.attackPhaseLabel === 'startup' ? -5 : state.attackPhaseLabel === 'active' ? 7 : state.attackPhaseLabel === 'recovery' ? 2 : 0;
  const shoulderDrop = state.attackPhaseLabel === 'recovery' ? 5 : 0;
  ctx.save(); ctx.translate(recoil, sway - 8 + airLift + shoulderDrop); ctx.rotate(lean);
  ctx.fillStyle = PALETTE.stageBlack;
  ctx.beginPath(); ctx.moveTo(-12, -35); ctx.lineTo(10, -34); ctx.lineTo(15, 13); ctx.lineTo(6, 26); ctx.lineTo(-8, 25); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fill();
  const runOffset = state.isRunning ? Math.sin(time / 80) * 2 : 0;
  ctx.fillRect(-12 - runOffset, 17, 8, 32); ctx.fillRect(5 + runOffset, 17, 8, 32);
  drawKhnFoot(ctx, -14 - runOffset, 49, -0.08); drawKhnFoot(ctx, 15 + runOffset, 49, 0.08);
  drawDotBand(ctx, -10, -28, 4, 3, 7, 'vertical', 2.5);
  drawDotBand(ctx, 3, -29, 3, 3, 7, 'vertical', 2.5);
  drawDotBand(ctx, -13 - runOffset, 22, 2, 4, 7, 'vertical', 2.5);
  drawDotBand(ctx, 6 + runOffset, 22, 2, 4, 7, 'vertical', 2.5);
  drawDotBand(ctx, -25, -7, 2, 3, 7, 'diagonal', 2.5);
  drawDotBand(ctx, 17, -11, 2, 3, 7, 'diagonal', 2.5);
  ctx.strokeStyle = PALETTE.tape; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -28); ctx.lineTo(13, -24); ctx.stroke();
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(-27, -8); ctx.lineTo(-20, 11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(25, -9); ctx.lineTo(18, 11); ctx.stroke();
  ctx.restore();
}

function drawKhnGuitar(ctx, time, state) {
  const snap = state.attackPhaseLabel === 'startup' ? 0.34 : state.attackPhaseLabel === 'active' ? -0.68 : state.attackPhaseLabel === 'recovery' ? -0.14 : state.isRunning ? -0.08 : Math.sin(time / 260) * 0.04;
  const x = state.attackPhaseLabel === 'startup' ? -12 : state.attackPhaseLabel === 'active' ? 14 : state.attackPhaseLabel === 'recovery' ? 5 : 0;
  ctx.save(); ctx.translate(x, -9 + (state.isAirborne ? -3 : 0)); ctx.rotate(snap);
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
  if (state.isAttacking && state.attackPhaseLabel !== 'startup') { ctx.globalAlpha = state.attackPhaseLabel === 'active' ? 0.75 : 0.42; ctx.strokeStyle = state.attackKind === 'special' ? PALETTE.green : PALETTE.pink; ctx.beginPath(); ctx.moveTo(-30, -24); ctx.quadraticCurveTo(8, -52, 66, -62); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, 8); ctx.quadraticCurveTo(10, -18, 68, -31); ctx.stroke(); }
  ctx.restore();
  drawKhnLoopModule(ctx, state.isAttacking);
}

function drawKhnMask(ctx, time, state) {
  const bob = Math.sin(time / (state.isRunning ? 120 : 210)) * (state.isRunning ? 1.9 : 1.0);
  const squashY = state.isAttacking && state.attackKind !== 'light' ? 0.94 : 1.04;
  const trail = state.attackPhaseLabel === 'startup' ? -9 : state.attackPhaseLabel === 'active' ? 8 : state.attackPhaseLabel === 'recovery' ? 3 : 0;
  const rotation = state.attackPhaseLabel === 'startup' ? 0.15 : state.attackPhaseLabel === 'active' ? -0.2 : state.attackPhaseLabel === 'recovery' ? -0.06 : state.isRunning ? -0.06 : Math.sin(time / 330) * 0.025;
  ctx.save(); ctx.translate(trail, -78 + bob + (state.isAirborne ? -3 : 0)); ctx.rotate(rotation); ctx.scale(1.06, squashY);
  ctx.fillStyle = PALETTE.paperShade; ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-32, -39); ctx.quadraticCurveTo(8, -57, 36, -24); ctx.quadraticCurveTo(52, -2, 28, 30); ctx.quadraticCurveTo(-8, 47, -42, 20); ctx.quadraticCurveTo(-52, -24, -32, -39); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, -20); ctx.quadraticCurveTo(82, -16, 104, 2); ctx.quadraticCurveTo(81, 15, 34, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(55,42,32,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(37, -13); ctx.quadraticCurveTo(66, -7, 91, 0); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 84, 82, 3);
  drawPaperSeams(ctx, 'khn');
  drawMaskDots(ctx, [-24, -24, -2, -34, 20, -25, -34, 2, 20, 16]);
  ctx.fillStyle = PALETTE.stageBlack; ctx.fillRect(-14, -13, 14, 4); ctx.fillRect(10, -10, 10, 3); ctx.fillRect(-7, 15, 16, 3);
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.quadraticCurveTo(2, -8, -2, 28); ctx.stroke();
  ctx.restore();
}

function drawKlek(ctx, time, state) {
  // Klek: grounded percussion silhouette, full dot suit, boulder mask, compact busy kit.
  drawKlekBody(ctx, time, state);
  drawKlekPercussion(ctx, time, state);
  drawKlekMask(ctx, time, state);
  if (state.isAttacking) drawActionGlyphs(ctx, 'percussion', state);
}

function drawKlekBody(ctx, time, state) {
  const stomp = state.attackPhaseLabel === 'startup' ? 7 : state.attackPhaseLabel === 'active' ? 2 : state.attackPhaseLabel === 'recovery' ? -1 : state.isRunning ? Math.abs(Math.sin(time / 95)) * 2.2 : Math.abs(Math.sin(time / 180)) * 1.1;
  ctx.save(); ctx.translate(0, stomp - 8); ctx.fillStyle = PALETTE.stageBlack;
  ctx.beginPath(); ctx.moveTo(-17, -31); ctx.lineTo(17, -31); ctx.lineTo(21, 8); ctx.lineTo(12, 25); ctx.lineTo(-13, 25); ctx.lineTo(-22, 8); ctx.closePath(); ctx.fill();
  const runOffset = state.isRunning ? Math.sin(time / 95) * 1.5 : 0;
  ctx.fillRect(-18 - runOffset, 17, 10, 31); ctx.fillRect(8 + runOffset, 17, 10, 31); drawKlekBoot(ctx, -17 - runOffset, 49, -0.03); drawKlekBoot(ctx, 18 + runOffset, 49, 0.03);
  drawDotBand(ctx, -14, -20, 3, 3, 9, 'diagonal', 3.2);
  drawDotBand(ctx, 9, -23, 3, 3, 9, 'diagonalBack', 3.2);
  drawDotBand(ctx, -18 - runOffset, 20, 2, 4, 8, 'vertical', 3.1);
  drawDotBand(ctx, 9 + runOffset, 20, 2, 4, 8, 'vertical', 3.1);
  drawDotBand(ctx, -28, -7, 2, 3, 7, 'diagonalBack', 3);
  drawDotBand(ctx, 22, -7, 2, 3, 7, 'diagonal', 3);
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-17, -27); ctx.lineTo(15, 23); ctx.moveTo(17, -27); ctx.lineTo(-14, 23); ctx.stroke();
  ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 8; ctx.lineCap = 'round'; const lift = state.attackPhaseLabel === 'startup' ? -22 : state.attackPhaseLabel === 'active' ? 10 : state.attackPhaseLabel === 'recovery' ? -7 : 0;
  ctx.beginPath(); ctx.moveTo(-14, -23); ctx.lineTo(-31, -10 + lift); ctx.lineTo(-23, 8 + lift); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -23); ctx.lineTo(32, -12 - lift); ctx.lineTo(25, 8 - lift); ctx.stroke();
  ctx.restore();
}

function drawKlekPercussion(ctx, time, state) {
  const strike = state.attackPhaseLabel === 'active';
  const windup = state.attackPhaseLabel === 'startup';
  const rebound = state.attackPhaseLabel === 'recovery';
  ctx.save(); ctx.translate(0, -7 + (strike ? 3 : Math.sin(time / 210) * 0.8)); ctx.fillStyle = PALETTE.stageBlack; ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(-30, 31, 34, 14, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(10, 21, 22, 9, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#34302b'; ctx.fillRect(27, -1, 28, 59); ctx.strokeRect(27, -1, 28, 59);
  ctx.fillStyle = '#272522'; ctx.beginPath(); ctx.ellipse(50, 36, 20, 10, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PALETTE.cardboard; ctx.beginPath(); ctx.moveTo(60, 36); ctx.lineTo(86, -12); ctx.lineTo(112, 36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-56, -16); ctx.lineTo(-56, 6); ctx.stroke(); ctx.fillStyle = '#8a7a58'; ctx.beginPath(); ctx.ellipse(-56, 8, 26, 6, -0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.paper; ctx.beginPath(); ctx.moveTo(3, -14); ctx.lineTo(20, -14); ctx.lineTo(11, 2); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-42, -3); ctx.lineTo(-72, 54); ctx.lineTo(-38, 80); ctx.stroke(); ctx.fillStyle = '#3a352d'; ctx.fillRect(-86, 16, 27, 48);
  ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-25, windup ? -35 : strike ? -5 : rebound ? -18 : -9); ctx.lineTo(-5, 20); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = '#6a4b34'; ctx.beginPath(); ctx.moveTo(26, windup ? -48 : strike ? -3 : rebound ? -24 : -10); ctx.lineTo(66, 12); ctx.stroke(); ctx.fillStyle = '#2d2925'; ctx.beginPath(); ctx.ellipse(70, windup ? -52 : strike ? 5 : rebound ? -16 : 10, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  if (strike || state.attackKind === 'special') { drawPercussionShock(ctx, state); }
  ctx.restore();
}

function drawKlekMask(ctx, time, state) {
  const squashY = state.isAttacking && state.attackKind !== 'light' ? 0.92 : 1.04;
  const hitShake = state.attackPhaseLabel === 'active' ? Math.sin(time / 12) * 3 : 0;
  const compress = state.attackPhaseLabel === 'startup' ? 5 : state.attackPhaseLabel === 'recovery' ? -2 : 0;
  ctx.save(); ctx.translate(hitShake, -79 + compress + (state.isRunning ? Math.sin(time / 120) * 1.2 : 0)); ctx.rotate(state.attackPhaseLabel === 'startup' ? -0.08 : state.attackPhaseLabel === 'active' ? 0.12 : state.isRunning ? 0.035 : 0); ctx.scale(1.07, squashY);
  ctx.fillStyle = PALETTE.paperShade; ctx.strokeStyle = PALETTE.stageBlack; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-54, -30); ctx.lineTo(-12, -54); ctx.lineTo(46, -40); ctx.quadraticCurveTo(63, -14, 49, 24); ctx.quadraticCurveTo(8, 49, -43, 31); ctx.quadraticCurveTo(-66, -4, -54, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(42, -18); ctx.quadraticCurveTo(82, -11, 102, 3); ctx.quadraticCurveTo(78, 15, 44, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(55,42,32,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(46, -11); ctx.quadraticCurveTo(73, -6, 92, 2); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 104, 90, 9);
  drawPaperSeams(ctx, 'klek');
  drawMaskDots(ctx, [-36, -20, -9, -35, 25, -27, -43, 7, 30, 17]);
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

function drawCostumeDots(ctx, coords, radius = 3) {
  ctx.fillStyle = PALETTE.paper;
  for (let i = 0; i < coords.length; i += 2) { ctx.beginPath(); ctx.arc(coords[i], coords[i + 1], radius, 0, Math.PI * 2); ctx.fill(); }
}

function drawDotBand(ctx, x, y, cols, rows, spacing, mode, radius = 3) {
  const coords = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const slant = mode === 'diagonal' ? row * 3 : mode === 'diagonalBack' ? -row * 3 : 0;
    coords.push(x + col * spacing + slant, y + row * spacing);
  }
  drawCostumeDots(ctx, coords, radius);
}

function drawMaskDots(ctx, coords) {
  ctx.save(); ctx.globalAlpha = 0.7; drawCostumeDots(ctx, coords); ctx.restore();
}

function drawPercussionShock(ctx, state) {
  ctx.strokeStyle = state.attackKind === 'special' ? PALETTE.yellow : PALETTE.bruise; ctx.lineWidth = 1.5; ctx.globalAlpha = state.attackPhaseLabel === 'recovery' ? 0.34 : 0.78;
  for (let i = 0; i < 3; i++) ctx.strokeRect(-64 - i * 7, 12 - i * 7, 84 + i * 14, 32 + i * 14);
  for (let i = 0; i < 5; i++) {
    const x = 72 + i * 10; const y = 5 - i * 4;
    ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y + 7); ctx.lineTo(x - 7, y + 7); ctx.closePath(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPaperSeams(ctx, character = 'shared') {
  ctx.strokeStyle = PALETTE.seam; ctx.lineWidth = 2;
  if (character === 'khn') {
    ctx.beginPath(); ctx.moveTo(-22, -28); ctx.quadraticCurveTo(1, -15, -5, 31); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-28, 16); ctx.quadraticCurveTo(0, 28, 25, 13); ctx.stroke();
  } else if (character === 'klek') {
    ctx.beginPath(); ctx.moveTo(-12, -50); ctx.lineTo(-2, 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-43, 22); ctx.quadraticCurveTo(-5, 35, 35, 18); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-18, -15); ctx.quadraticCurveTo(-3, -23, 15, -17); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-17, 15); ctx.quadraticCurveTo(0, 23, 18, 13); ctx.stroke();
  }
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

function drawActionGlyphs(ctx, type, state) {
  ctx.save(); ctx.lineWidth = 1.5; ctx.globalAlpha = 0.78;
  if (state.attackKind === 'special') {
    ctx.strokeStyle = type === 'microtone' ? PALETTE.green : PALETTE.yellow; ctx.globalAlpha = 0.32;
    const y = type === 'microtone' ? -38 : 18;
    ctx.beginPath(); ctx.moveTo(-46, y + 26); ctx.lineTo(0, y - 42); ctx.lineTo(46, y + 26); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.78;
  }
  if (type === 'microtone') { ctx.strokeStyle = state.attackKind === 'special' ? PALETTE.green : PALETTE.pink; const reach = state.attackPhaseLabel === 'active' ? 16 : state.attackPhaseLabel === 'startup' ? -6 : 4; for (let i = 0; i < 7; i++) { const x = 28 + reach + i * 6; const y = -50 + Math.sin(i) * 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y - 12); ctx.stroke(); } }
  else { ctx.strokeStyle = state.attackKind === 'special' ? PALETTE.yellow : PALETTE.bruise; const radius = state.attackPhaseLabel === 'active' ? 54 : state.attackPhaseLabel === 'startup' ? 28 : 38; for (let i = 0; i < 10; i++) { const a = (Math.PI * 2 * i) / 10; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, 18 + Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * radius, 18 + Math.sin(a) * (radius * 0.42)); ctx.stroke(); } }
  ctx.restore();
}
