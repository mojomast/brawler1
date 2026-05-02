import { LANE_MAX, LANE_MIN, playerConfig } from '../config/constants.js';
import { clamp, overlaps } from '../utils/math.js';

export class Player {
  constructor(x, y, config = playerConfig) {
    this.config = config;
    this.x = x; this.y = y; this.z = 0; this.vx = 0; this.vz = 0; this.facing = 1;
    this.w = 48; this.h = 88; this.health = this.config.maxHealth; this.meter = 0;
    this.state = 'idle'; this.attack = null; this.attackTimer = 0; this.hitEnemies = new Set();
    this.dashTimer = 0; this.dashCooldown = 0; this.invuln = 0; this.combo = 0; this.comboTimer = 0;
    this.bufferedAttack = null; this.bufferTimer = 0;
  }

  update(dt, input, enemies, fx, bounds = { left: 42, right: 918 }) {
    this.invuln = Math.max(0, this.invuln - dt); this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.bufferTimer = Math.max(0, this.bufferTimer - dt); if (this.bufferTimer === 0) this.bufferedAttack = null;
    if (this.comboTimer > 0) this.comboTimer -= dt; else this.combo = 0;
    if (this.health <= 0) { this.state = 'defeated'; return; }
    if (this.attack) this.updateAttack(dt, enemies, fx);

    const locked = this.attack && this.attackTimer < this.attack.startup + this.attack.active + this.attack.recovery;
    this.captureAttackInput(input);
    if (!locked) this.readActions(input);
    if (this.dashTimer > 0) { this.dashTimer -= dt; this.x += this.facing * this.config.dashSpeed * dt; }
    else if (!locked) this.move(dt, input);
    this.vz -= this.config.gravity * dt; this.z += this.vz * dt;
    if (this.z <= 0) { this.z = 0; if (this.vz < 0) this.vz = 0; }
    this.x = clamp(this.x, bounds.left, bounds.right); this.y = clamp(this.y, LANE_MIN, LANE_MAX);
  }

  readActions(input) {
    if (input.wasPressed('Space') && this.z === 0) this.vz = this.config.jumpVelocity;
    if (input.wasPressed('ShiftLeft', 'ShiftRight') && this.dashCooldown === 0) { this.dashTimer = this.config.dashDuration; this.dashCooldown = this.config.dashCooldown; }
    if (this.bufferedAttack) this.consumeBufferedAttack();
  }

  captureAttackInput(input) {
    if (input.wasPressed('KeyJ', 'KeyZ')) this.setBufferedAttack('light');
    if (input.wasPressed('KeyK', 'KeyX')) this.setBufferedAttack('heavy');
    if (input.wasPressed('KeyL', 'KeyC')) this.setBufferedAttack('special');
  }

  setBufferedAttack(kind) { this.bufferedAttack = kind; this.bufferTimer = 0.15; }

  consumeBufferedAttack() {
    const kind = this.bufferedAttack;
    if (kind === 'special' && this.meter < 100) return;
    this.bufferedAttack = null; this.bufferTimer = 0;
    if (kind === 'special') this.meter = 0;
    this.startAttack(kind);
  }

  move(dt, input) {
    const xAxis = (input.isDown('ArrowRight', 'KeyD') ? 1 : 0) - (input.isDown('ArrowLeft', 'KeyA') ? 1 : 0);
    const yAxis = (input.isDown('ArrowDown', 'KeyS') ? 1 : 0) - (input.isDown('ArrowUp', 'KeyW') ? 1 : 0);
    if (xAxis) this.facing = xAxis;
    this.x += xAxis * this.config.moveSpeed * dt; this.y += yAxis * this.config.laneSpeed * dt;
    this.state = xAxis || yAxis ? 'run' : 'idle';
  }

  startAttack(kind) {
    this.attack = { kind, ...this.config.attacks[kind] }; this.attackTimer = 0; this.hitEnemies.clear(); this.state = kind;
    if (kind === 'light') { this.combo = (this.combo % 3) + 1; this.comboTimer = 0.7; }
  }

  updateAttack(dt, enemies, fx) {
    this.attackTimer += dt;
    const active = this.attackTimer >= this.attack.startup && this.attackTimer <= this.attack.startup + this.attack.active;
    if (active) {
      const box = this.attackBox();
      for (const enemy of enemies) {
        if (!this.hitEnemies.has(enemy) && enemy.state !== 'defeated' && overlaps(box, enemy.hurtBox())) {
          this.hitEnemies.add(enemy); enemy.takeHit(this.attack.damage, this.facing, this.attack.knockback);
          this.meter = clamp(this.meter + (this.attack.meter || 0) + (enemy.health <= 0 ? 30 : 0), 0, 100);
          fx.burst(enemy.x, enemy.y - 48, this.attack.kind, enemy.config?.isBoss);
        }
      }
    }
    if (this.attackTimer > this.attack.startup + this.attack.active + this.attack.recovery) this.attack = null;
  }

  takeHit(damage, direction) {
    if (this.invuln > 0 || this.health <= 0) return;
    this.health = Math.max(0, this.health - damage); this.invuln = this.config.invulnerableAfterHit; this.x += direction * 24; this.state = 'hitstun';
  }

  hurtBox() { return { x: this.x - this.w / 2, y: this.y - this.h - this.z, w: this.w, h: this.h }; }
  attackBox() { return { x: this.x + this.facing * 28 + (this.facing > 0 ? 0 : -this.attack.width), y: this.y - this.z - this.attack.height - 20, w: this.attack.width, h: this.attack.height }; }

  draw(ctx) {
    const time = performance.now();
    const bob = this.state === 'run' ? Math.sin(time / 80) * 3 : 0;
    const isKlek = this.config.id === 'klek';
    ctx.save(); ctx.translate(this.x, this.y - this.z + bob); ctx.scale(this.facing, 1);
    ctx.globalAlpha = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 ? 0.45 : 1;
    drawStageShadow(ctx);
    if (isKlek) drawKlek(ctx, time, this.attack);
    else drawKhn(ctx, time, this.attack);
    if (this.attack) { const b = this.attackBox(); ctx.globalAlpha = 0.28; ctx.scale(this.facing, 1); ctx.fillStyle = this.attack.kind === 'special' ? '#a4c639' : '#ff5ca8'; ctx.fillRect(b.x * this.facing - this.x * this.facing, b.y - this.y + this.z, b.w, b.h); }
    ctx.restore();
  }
}

function drawStageShadow(ctx) {
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 14, 38, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawKhn(ctx, time, attack) {
  const attacking = Boolean(attack);
  drawKhnBody(ctx, time, attacking);
  drawKhnGuitar(ctx, time, attacking);
  drawKhnMask(ctx, time, attacking);
  if (attacking) drawActionGlyphs(ctx, 'microtone');
}

function drawKhnBody(ctx, time, attacking) {
  const lean = attacking ? -0.2 : -0.08;
  const sway = Math.sin(time / 180) * 1.5;
  ctx.save(); ctx.translate(0, sway - 8); ctx.rotate(lean);
  ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.moveTo(-11, -34); ctx.lineTo(11, -33); ctx.lineTo(15, 12); ctx.lineTo(6, 25); ctx.lineTo(-8, 24); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fill();
  ctx.fillRect(-11, 18, 7, 30); ctx.fillRect(4, 17, 7, 31);
  drawKhnFoot(ctx, -13, 48, -0.08); drawKhnFoot(ctx, 14, 48, 0.08);
  drawCostumeDots(ctx, [-4, -23, 3, -9, -5, 5]);
  ctx.strokeStyle = '#d8d2bf'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -28); ctx.lineTo(13, -24); ctx.stroke();
  ctx.strokeStyle = '#050505'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(-26, -7); ctx.lineTo(-19, 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(24, -8); ctx.lineTo(18, 9); ctx.stroke();
  ctx.restore();
}

function drawKhnGuitar(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -9); ctx.rotate(attacking ? -0.34 : Math.sin(time / 250) * 0.04);
  ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(62, -48); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-18, -7); ctx.lineTo(45, -18); ctx.stroke();
  ctx.strokeStyle = '#050505'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(62, -48); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -7); ctx.lineTo(45, -18); ctx.stroke();
  ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) { const x = -9 + i * 6 + (i % 3 === 0 ? 2 : 0); const y = -20 - i * 2.45; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y + 5); ctx.stroke(); }
  ctx.fillStyle = '#050505'; ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-39, -18); ctx.lineTo(-13, -28); ctx.lineTo(2, -3); ctx.lineTo(-18, 18); ctx.lineTo(-43, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(-27, -11, 10, 3); ctx.fillRect(-26, -3, 12, 2);
  if (attacking) { ctx.globalAlpha = 0.55; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-30, -24); ctx.quadraticCurveTo(5, -48, 49, -55); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, 8); ctx.quadraticCurveTo(6, -15, 54, -28); ctx.stroke(); }
  ctx.restore();
  drawKhnLoopModule(ctx, attacking);
}

function drawKhnMask(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -74 + Math.sin(time / 190) * 1.2); ctx.rotate(attacking ? -0.09 : Math.sin(time / 320) * 0.03);
  ctx.fillStyle = '#e8e1cf'; ctx.strokeStyle = '#050505'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-28, -36); ctx.quadraticCurveTo(10, -52, 32, -19); ctx.quadraticCurveTo(50, -5, 30, 9); ctx.quadraticCurveTo(22, 36, -13, 42); ctx.quadraticCurveTo(-45, 30, -42, -7); ctx.quadraticCurveTo(-48, -29, -28, -36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(27, -16); ctx.lineTo(60, -7); ctx.lineTo(29, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 84, 82, 3);
  drawPaperSeams(ctx);
  ctx.fillStyle = '#050505'; ctx.fillRect(-14, -13, 14, 4); ctx.fillRect(10, -10, 10, 3); ctx.fillRect(-7, 15, 16, 3);
  ctx.strokeStyle = '#050505'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.quadraticCurveTo(2, -8, -2, 28); ctx.stroke();
  ctx.restore();
}

function drawKlek(ctx, time, attack) {
  const attacking = Boolean(attack);
  drawKlekBody(ctx, time, attacking);
  drawKlekPercussion(ctx, time, attacking);
  drawKlekMask(ctx, time, attacking);
  if (attacking) drawActionGlyphs(ctx, 'percussion');
}

function drawKlekBody(ctx, time, attacking) {
  const stomp = attacking ? 3 : Math.abs(Math.sin(time / 150)) * 1.4;
  ctx.save(); ctx.translate(0, stomp - 8); ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.moveTo(-17, -31); ctx.lineTo(17, -31); ctx.lineTo(21, 8); ctx.lineTo(12, 25); ctx.lineTo(-13, 25); ctx.lineTo(-22, 8); ctx.closePath(); ctx.fill();
  ctx.fillRect(-17, 17, 9, 31); ctx.fillRect(8, 17, 9, 31); drawKlekBoot(ctx, -16, 48, -0.03); drawKlekBoot(ctx, 17, 48, 0.03);
  drawCostumeDots(ctx, [-8, -20, 8, -18, 0, -2, -10, 10, 11, 9]);
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-17, -27); ctx.lineTo(15, 23); ctx.moveTo(17, -27); ctx.lineTo(-14, 23); ctx.stroke();
  ctx.strokeStyle = '#050505'; ctx.lineWidth = 8; ctx.lineCap = 'round'; const lift = attacking ? -12 : 0;
  ctx.beginPath(); ctx.moveTo(-14, -23); ctx.lineTo(-31, -10 + lift); ctx.lineTo(-23, 8 + lift); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -23); ctx.lineTo(32, -12 - lift); ctx.lineTo(25, 8 - lift); ctx.stroke();
  ctx.restore();
}

function drawKlekPercussion(ctx, time, attacking) {
  ctx.save(); ctx.translate(0, -7); ctx.fillStyle = '#050505'; ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(-28, 30, 35, 13, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#34302b'; ctx.fillRect(18, -2, 30, 62); ctx.strokeRect(18, -2, 30, 62);
  ctx.fillStyle = '#8a4f2a'; ctx.beginPath(); ctx.moveTo(60, 36); ctx.lineTo(86, -12); ctx.lineTo(112, 36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-56, -16); ctx.lineTo(-56, 6); ctx.stroke(); ctx.fillStyle = '#8a7a58'; ctx.beginPath(); ctx.ellipse(-56, 8, 26, 6, -0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5b4a38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-42, -3); ctx.lineTo(-72, 54); ctx.lineTo(-38, 80); ctx.stroke(); ctx.fillStyle = '#3a352d'; ctx.fillRect(-86, 16, 27, 48);
  ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-25, attacking ? -24 : -9); ctx.lineTo(-5, 20); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = '#6a4b34'; ctx.beginPath(); ctx.moveTo(26, attacking ? -42 : -10); ctx.lineTo(66, 12); ctx.stroke(); ctx.fillStyle = '#2d2925'; ctx.beginPath(); ctx.ellipse(70, attacking ? -46 : 10, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  if (attacking) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 * i) / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, 25 + Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 35, 25 + Math.sin(a) * 15); ctx.stroke(); } }
  ctx.restore();
}

function drawKlekMask(ctx, time, attacking) {
  ctx.save(); ctx.translate(attacking ? Math.sin(time / 12) * 2 : 0, -74); ctx.rotate(attacking ? Math.sin(time / 16) * 0.08 : 0);
  ctx.fillStyle = '#e8e1cf'; ctx.strokeStyle = '#050505'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-48, -27); ctx.lineTo(-14, -51); ctx.lineTo(42, -38); ctx.quadraticCurveTo(62, -12, 45, 24); ctx.quadraticCurveTo(6, 48, -40, 30); ctx.quadraticCurveTo(-62, -2, -48, -27); ctx.closePath(); ctx.fill(); ctx.stroke();
  drawPaperMacheTexture(ctx, 0, 0, 104, 90, 9);
  drawPaperSeams(ctx);
  ctx.strokeStyle = 'rgba(55,42,32,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -51); ctx.lineTo(-2, 38); ctx.stroke();
  ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.ellipse(-24, -14, 8, 4, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(23, -5, 6, 3, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-25, 17, 43, 5); ctx.fillStyle = '#d8d2bf'; ctx.fillRect(-6, 16, 7, 2); ctx.fillRect(9, 20, 8, 2);
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
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#24211e'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#d9c7a6'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(10 + i * 4, -3 + (i % 2), 3, 4, 0.2, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
}

function drawKlekBoot(ctx, x, y, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#1f1d1a'; ctx.fillRect(-18, -6, 36, 12); ctx.fillStyle = '#4a4035'; ctx.fillRect(6, -5, 18, 10); ctx.restore();
}

function drawCostumeDots(ctx, coords) {
  ctx.fillStyle = '#f4f1e8';
  for (let i = 0; i < coords.length; i += 2) { ctx.beginPath(); ctx.arc(coords[i], coords[i + 1], 3, 0, Math.PI * 2); ctx.fill(); }
}

function drawPaperSeams(ctx) {
  ctx.strokeStyle = '#cfc6ad'; ctx.lineWidth = 2;
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
