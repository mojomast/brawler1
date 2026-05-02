import { enemyConfig, LANE_MAX, LANE_MIN } from '../config/constants.js';
import { clamp, overlaps, sign } from '../utils/math.js';

const DEBUG_ATTACK = false;

export class Enemy {
  constructor(x, y, type = {}) {
    this.config = { ...enemyConfig, ...type };
    this.x = x; this.y = y; this.w = this.config.w; this.h = this.config.h; this.label = this.config.label || 'Algorithm Executive'; this.health = this.config.maxHealth;
    this.maxHealth = this.config.maxHealth; this.phase = 1; this.summonReady = false;
    this.recentlyHit = 0; this.bounds = this.config.bounds || { left: 48, right: 912 };
    this.targetX = this.config.targetX ?? x;
    this.state = this.config.entryState || 'idle'; this.facing = -1; this.timer = 0; this.cooldown = 0; this.hitPlayer = false; this.remove = false; this.animTime = 0;
  }

  update(dt, player) {
    this.animTime += dt;
    this.cooldown = Math.max(0, this.cooldown - dt); this.timer = Math.max(0, this.timer - dt); this.recentlyHit = Math.max(0, this.recentlyHit - dt);
    if (this.state === 'defeated') { if (this.timer === 0) this.remove = true; return; }
    if (this.state === 'entering') return this.updateEntering(dt);
    if (this.state === 'hitstun') { if (this.timer === 0) this.state = 'chase'; return; }
    if (this.state === 'attack') return this.updateAttack(dt, player);
    const dx = player.x - this.x; const dy = Math.abs(player.y - this.y); this.facing = sign(dx || this.facing);
    const distance = Math.abs(dx);
    if (this.config.isBoss) this.checkBossPhase();
    if (distance < this.config.aggroRange) this.state = 'chase';
    if (this.state === 'chase') {
      if (this.config.retreatRange && distance < this.config.retreatRange && dy <= 34) this.x -= this.facing * this.config.moveSpeed * 0.65 * dt;
      else if (distance > this.config.attackRange || dy > 32) this.x += this.facing * this.config.moveSpeed * dt;
      if (dy > 18) this.y += sign(player.y - this.y) * (this.config.laneSpeed || 75) * dt;
      if (distance <= this.config.attackRange && dy <= 34 && this.cooldown === 0) this.startAttack();
    }
    this.clampPosition();
  }

  updateEntering(dt) {
    const dx = this.targetX - this.x; this.facing = sign(dx || this.facing);
    this.x += this.facing * this.config.moveSpeed * 1.25 * dt;
    if (Math.abs(dx) < 6) this.state = 'chase';
    this.clampPosition();
  }

  startAttack() { this.state = 'attack'; this.timer = this.config.attackStartup + this.config.attackActive + this.config.attackRecovery; this.hitPlayer = false; }

  updateAttack(dt, player) {
    const elapsed = this.config.attackStartup + this.config.attackActive + this.config.attackRecovery - this.timer;
    const active = elapsed >= this.config.attackStartup && elapsed <= this.config.attackStartup + this.config.attackActive;
    if (active && !this.hitPlayer && overlaps(this.attackBox(), player.hurtBox())) { this.hitPlayer = true; player.takeHit(this.config.attackDamage, this.facing); }
    if (this.timer === 0) { this.state = 'chase'; this.cooldown = this.config.attackCooldown; }
  }

  takeHit(damage, direction, knockback) {
    this.health = Math.max(0, this.health - damage); this.x += direction * knockback * 0.08; this.facing = -direction; this.recentlyHit = 1.4;
    if (this.health === 0) { this.state = 'defeated'; this.timer = this.config.despawnDelay; }
    else { this.state = 'hitstun'; this.timer = this.config.hitstunDuration; }
    this.clampPosition();
  }

  // Enemy bounds are intentionally wider than the player gate so encounters can fill the whole visible stage.
  clampPosition() { this.x = clamp(this.x, this.bounds.left, this.bounds.right); this.y = clamp(this.y, LANE_MIN, LANE_MAX); }

  checkBossPhase() {
    const pct = this.health / this.maxHealth;
    const next = pct < 0.34 ? 3 : pct < 0.67 ? 2 : 1;
    if (next > this.phase) {
      this.phase = next; this.summonReady = true;
      const mod = this.config.phaseMods?.[next - 1] || { moveSpeed: 1.18, attackCooldown: 0.82, attackDamage: 3 };
      this.config.moveSpeed *= mod.moveSpeed || 1; this.config.attackCooldown *= mod.attackCooldown || 1; this.config.attackDamage += mod.attackDamage || 0;
    }
  }

  hurtBox() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  attackBox() { return { x: this.x + this.facing * 24 + (this.facing > 0 ? 0 : -this.config.attackRange), y: this.y - 62, w: this.config.attackRange, h: 42 }; }

  attackPhase() {
    if (this.state !== 'attack') return { phase: 0, label: 'idle' };
    const total = this.config.attackStartup + this.config.attackActive + this.config.attackRecovery;
    const elapsed = total - this.timer;
    const phase = Math.min(1, Math.max(0, elapsed / total));
    if (elapsed < this.config.attackStartup) return { phase, label: 'startup' };
    if (elapsed <= this.config.attackStartup + this.config.attackActive) return { phase, label: 'active' };
    return { phase, label: 'recovery' };
  }

  draw(ctx) {
    const attack = this.attackPhase();
    const bob = this.state === 'chase' || this.state === 'entering' ? Math.sin(this.animTime * 12) * 2.5 : this.state === 'idle' ? Math.sin(this.animTime * 4) * 1.2 : 0;
    const lean = this.state === 'chase' || this.state === 'entering' ? -0.09 : attack.label === 'startup' ? 0.15 : attack.label === 'active' ? -0.2 : attack.label === 'recovery' ? -0.05 : 0;
    const lunge = attack.label === 'startup' ? -5 : attack.label === 'active' ? 13 : attack.label === 'recovery' ? 4 : this.state === 'hitstun' ? -10 : 0;
    const squash = this.state === 'hitstun' ? 0.88 : this.state === 'defeated' ? 0.34 : 1;
    const fall = this.state === 'defeated' ? 28 * (1 - Math.max(0, this.timer / this.config.despawnDelay)) : 0;
    ctx.save(); ctx.translate(this.x, this.y + bob + fall); ctx.scale(this.facing, 1); ctx.translate(lunge, 0); ctx.rotate(this.state === 'hitstun' ? -0.12 : this.state === 'defeated' ? 0.55 : lean); ctx.scale(1, squash);
    ctx.globalAlpha = this.state === 'defeated' ? 0.35 : this.recentlyHit > 0 && Math.floor(this.recentlyHit * 18) % 2 ? 0.72 : 1;
    const shapeScale = this.config.bodyShape === 'wide' ? 1.25 : this.config.bodyShape === 'thin' ? 0.75 : 1;
    const slouch = this.config.bodyShape === 'slouch' ? 6 : 0;
    ctx.fillStyle = this.config.color; ctx.fillRect((-this.w * shapeScale) / 2, -this.h + 6 + slouch, this.w * shapeScale, this.h - 6);
    ctx.fillStyle = '#111018'; ctx.fillRect(-20, -66, 40, 58);
    ctx.fillStyle = '#f6e6b8'; ctx.fillRect(-19, -96, 38, 28);
    ctx.fillStyle = this.config.accent; ctx.fillRect(-10, -68, 20, 36);
    ctx.fillRect(4, -48, 14, 20);
    ctx.fillStyle = '#fff7e0'; ctx.fillRect(-15, -86, 7, 5); ctx.fillRect(8, -86, 7, 5);
    ctx.strokeStyle = this.config.accent; ctx.lineWidth = 3; ctx.strokeRect(-32, -61, 18, 24);
    ctx.fillStyle = '#1c355e'; ctx.fillRect(12, -42, 30, 24);
    if (this.config.isBoss) { ctx.fillStyle = '#ffd447'; ctx.fillRect(-34, -116, 68, 12); ctx.fillText(`PHASE ${this.phase}`, -23, -121); }
    this.drawProp(ctx, attack);
    if (this.state === 'attack') {
      ctx.fillStyle = this.config.tellColor || '#ffd447'; ctx.globalAlpha = attack.label === 'active' ? 0.95 : 0.55;
      ctx.fillRect(18, attack.label === 'startup' ? -66 : -58, Math.min(this.config.attackRange, 130), attack.label === 'active' ? 16 : 10); ctx.globalAlpha = 1;
      if (DEBUG_ATTACK) { const box = this.attackBox(); ctx.save(); ctx.scale(1 / this.facing, 1); ctx.translate(-this.x, -this.y); ctx.strokeStyle = '#ffd447'; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore(); }
    }
    ctx.restore();
    const bw = this.config.isBoss ? 120 : 48;
    ctx.fillStyle = '#111018'; ctx.fillRect(this.x - bw / 2, this.y - 102, bw, 6); ctx.fillStyle = this.config.accent; ctx.fillRect(this.x - bw / 2, this.y - 102, bw * (this.health / this.maxHealth), 6);
    if (this.config.isBoss || this.recentlyHit > 0) {
      ctx.font = this.config.isBoss ? '13px system-ui, sans-serif' : '10px system-ui, sans-serif'; ctx.textAlign = 'center';
      const textWidth = ctx.measureText(this.label).width + 10;
      ctx.fillStyle = 'rgba(17,16,24,.78)'; ctx.fillRect(this.x - textWidth / 2, this.y + 7, textWidth, 18);
      ctx.fillStyle = '#fff7e0'; ctx.fillText(this.label, this.x, this.y + 20); ctx.textAlign = 'left';
    }
  }

  drawProp(ctx, attack = { label: 'idle', phase: 0 }) {
    ctx.save(); ctx.strokeStyle = this.config.accent; ctx.fillStyle = this.config.accent; ctx.lineWidth = 3;
    const shape = this.config.weaponShape || 'default';
    const windup = attack.label === 'startup'; const active = attack.label === 'active'; const recovery = attack.label === 'recovery';
    const angle = windup ? -0.75 : active ? 0.48 : recovery ? 0.18 : Math.sin(this.animTime * 3) * 0.04;
    if (shape === 'phone') { ctx.translate(31, -50); ctx.rotate(angle); ctx.strokeRect(-7, -12, 14, 24); }
    else if (shape === 'clipboard') { ctx.translate(32, -48); ctx.rotate(angle * 0.8); ctx.fillRect(-10, -14, 20, 28); }
    else if (shape === 'cable') { ctx.beginPath(); ctx.moveTo(20, -45); ctx.bezierCurveTo(52, windup ? -88 : -78, 74, active ? -18 : -32, active ? 124 : 104, -58); ctx.stroke(); }
    else if (shape === 'ring') { ctx.beginPath(); ctx.ellipse(active ? 50 : 35, -58, active ? 28 : 18, 18, angle, 0, Math.PI * 2); ctx.stroke(); }
    else if (shape === 'box') { ctx.translate(34, -32); ctx.rotate(angle * 0.5); ctx.strokeRect(-17, -13, 34, 26); }
    else if (shape === 'record') { ctx.translate(active ? 45 : 31, -56); ctx.rotate(this.animTime * 8 + (active ? 1.2 : 0)); ctx.beginPath(); ctx.arc(0, 0, active ? 20 : 16, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); }
    else if (shape === 'megaphone') { ctx.translate(20, -58); ctx.rotate(active ? 0.16 : windup ? -0.24 : 0); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(36, -14); ctx.lineTo(36, 14); ctx.closePath(); ctx.stroke(); if (active) { ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(46, -18); ctx.lineTo(84, -32); ctx.moveTo(46, 0); ctx.lineTo(92, 0); ctx.moveTo(46, 18); ctx.lineTo(84, 32); ctx.stroke(); ctx.globalAlpha = 1; } }
    else if (shape === 'hydra') for (let i = 0; i < this.phase; i++) ctx.strokeRect(-32 + i * 28, -126, 20, 20);
    else { ctx.translate(active ? 30 : 18, -58); ctx.rotate(angle); ctx.fillRect(0, 0, 28, 10); }
    ctx.restore();
  }
}
