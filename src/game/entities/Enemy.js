import { enemyConfig, LANE_MAX, LANE_MIN } from '../config/constants.js';
import { clamp, overlaps, sign } from '../utils/math.js';

export class Enemy {
  constructor(x, y, type = {}) {
    this.config = { ...enemyConfig, ...type };
    this.x = x; this.y = y; this.w = this.config.w; this.h = this.config.h; this.label = this.config.label || 'Algorithm Executive'; this.health = this.config.maxHealth;
    this.maxHealth = this.config.maxHealth; this.phase = 1; this.summonReady = false;
    this.recentlyHit = 0; this.bounds = this.config.bounds || { left: 48, right: 912 };
    this.targetX = this.config.targetX ?? x;
    this.state = this.config.entryState || 'idle'; this.facing = -1; this.timer = 0; this.cooldown = 0; this.hitPlayer = false; this.remove = false;
  }

  update(dt, player) {
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

  draw(ctx) {
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(this.facing, 1);
    ctx.globalAlpha = this.state === 'defeated' ? 0.35 : 1;
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
    this.drawProp(ctx);
    if (this.state === 'attack') { ctx.fillStyle = this.config.tellColor || '#ffd447'; ctx.globalAlpha = 0.85; ctx.fillRect(18, -58, Math.min(this.config.attackRange, 130), 12); ctx.globalAlpha = 1; }
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

  drawProp(ctx) {
    ctx.save(); ctx.strokeStyle = this.config.accent; ctx.fillStyle = this.config.accent; ctx.lineWidth = 3;
    const shape = this.config.weaponShape || 'default';
    if (shape === 'phone') ctx.strokeRect(25, -62, 14, 24);
    else if (shape === 'clipboard') ctx.fillRect(23, -62, 20, 28);
    else if (shape === 'cable') { ctx.beginPath(); ctx.moveTo(20, -45); ctx.bezierCurveTo(52, -78, 74, -32, 104, -58); ctx.stroke(); }
    else if (shape === 'ring') { ctx.beginPath(); ctx.arc(35, -58, 18, 0, Math.PI * 2); ctx.stroke(); }
    else if (shape === 'box') ctx.strokeRect(20, -45, 34, 26);
    else if (shape === 'record') { ctx.beginPath(); ctx.arc(31, -56, 16, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(31, -56, 4, 0, Math.PI * 2); ctx.fill(); }
    else if (shape === 'megaphone') { ctx.beginPath(); ctx.moveTo(20, -58); ctx.lineTo(56, -72); ctx.lineTo(56, -44); ctx.closePath(); ctx.stroke(); }
    else if (shape === 'hydra') for (let i = 0; i < this.phase; i++) ctx.strokeRect(-32 + i * 28, -126, 20, 20);
    else ctx.fillRect(18, -58, 28, 10);
    ctx.restore();
  }
}
