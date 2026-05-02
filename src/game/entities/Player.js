import { LANE_MAX, LANE_MIN, playerConfig } from '../config/constants.js';
import { drawProtagonist } from './ProtagonistArt.js';
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
    drawProtagonist(ctx, this, performance.now());
  }
}
