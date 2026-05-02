export function drawHud(ctx, player, director, enemies, mode, selectedCharacter, buttons = [], input = null) {
  ctx.save(); ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(17,16,24,.74)'; ctx.fillRect(16, 14, 286, 78); ctx.fillRect(748, 14, 184, 78);
  bar(ctx, 24, 22, 260, 18, player.health / player.config.maxHealth, '#9e1b32', `${player.config.name} Health`);
  bar(ctx, 24, 50, 220, 14, player.meter / 100, '#ffd447', 'Special');
  ctx.fillStyle = '#fff7e0'; ctx.fillText(`Stage ${director.stage + 1} / 4`, 760, 30); ctx.fillText(`Encounter ${Math.min(director.wave, director.waves.length)} / ${director.waves.length}`, 760, 56); ctx.fillText(director.scrollLocked ? `Enemies ${enemies.length}` : 'Scroll to next gate', 760, 82);
  if (director.lastStageTitle > 0 && mode === 'play') stageCard(ctx, director.currentStage());
  if (mode !== 'play') overlay(ctx, mode, selectedCharacter, buttons, input);
  ctx.restore();
}

function bar(ctx, x, y, w, h, pct, color, label) {
  ctx.fillStyle = '#111018'; ctx.fillRect(x, y, w, h); ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, pct), h); ctx.strokeStyle = '#fff7e0'; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#fff7e0'; ctx.fillText(label, x, y + h + 18);
}

function overlay(ctx, mode, selectedCharacter = 'khn', buttons = [], input = null) {
  ctx.fillStyle = 'rgba(17,16,24,.78)'; ctx.fillRect(0, 0, 960, 540); ctx.textAlign = 'center';
  ctx.fillStyle = '#fff7e0'; ctx.font = '48px system-ui, sans-serif';
  const title = mode === 'title' ? 'ANTI-ARENA' : mode === 'select' ? 'CHOOSE YOUR POITRINE' : mode === 'pause' ? 'PAUSED' : mode === 'win' ? 'ANTI-ARENA CLEARED' : 'GAME OVER';
  ctx.fillText(title, 480, 220); ctx.font = '20px system-ui, sans-serif';
  const copy = mode === 'title' ? 'Press Enter for character select. Papier-mache anti-arena ritual.' : mode === 'select' ? `Khn: microtonal guitar/bass fighter     Klek: percussion shockwave fighter     Selected: ${selectedCharacter.toUpperCase()}` : 'Press Enter to continue or restart.';
  ctx.fillText(copy, 480, 270);
  for (const button of buttons) drawButton(ctx, button, input?.isHovering(button));
  ctx.fillText('Move: WASD/Arrows  Jump: Space  Dash: Shift  Light/Heavy/Special: J/K/L  Pause: P', 480, 500); ctx.textAlign = 'left';
}

function drawButton(ctx, button, hover = false) {
  ctx.save(); ctx.textAlign = 'center';
  ctx.fillStyle = button.selected ? '#ffd447' : hover ? '#4b2e83' : '#111018';
  ctx.strokeStyle = button.selected ? '#fff7e0' : '#ffd447'; ctx.lineWidth = 3;
  ctx.fillRect(button.x, button.y, button.w, button.h); ctx.strokeRect(button.x, button.y, button.w, button.h);
  ctx.fillStyle = button.selected ? '#111018' : '#fff7e0'; ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 + 7);
  ctx.restore();
}

function stageCard(ctx, stage) {
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(17,16,24,.68)'; ctx.fillRect(180, 120, 600, 100);
  ctx.fillStyle = '#ffd447'; ctx.font = '30px system-ui, sans-serif'; ctx.fillText(stage.name, 480, 160);
  ctx.fillStyle = '#fff7e0'; ctx.font = '17px system-ui, sans-serif'; ctx.fillText(stage.subtitle, 480, 194); ctx.restore();
}
