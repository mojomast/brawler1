import { HEIGHT, WIDTH, playerConfigs } from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { stages, WaveDirector } from '../ai/WaveDirector.js';
import { Input } from '../systems/Input.js';
import { Particles } from '../fx/Particles.js';
import { drawHud } from '../ui/Hud.js';
import { clamp } from '../utils/math.js';

export class GameScene {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.input = new Input(canvas); this.last = 0; this.selectedCharacter = 'khn';
    this.music = new Audio('/public/audio/theme-music.mp3'); this.music.loop = true; this.music.volume = 0.65; this.musicStarted = false;
    this.reset('title');
  }
  reset(mode = 'play') { this.player = new Player(220, 390, playerConfigs[this.selectedCharacter]); this.enemies = []; this.director = new WaveDirector(); this.fx = new Particles(); this.cameraX = 0; this.mode = mode; }
  start() { requestAnimationFrame((time) => this.loop(time)); }
  loop(time) { const dt = Math.min(0.033, (time - this.last) / 1000 || 0); this.last = time; this.update(dt); this.draw(); this.input.endFrame(); requestAnimationFrame((next) => this.loop(next)); }
  update(dt) {
    if (this.input.wasPressed('Digit1')) this.selectedCharacter = 'khn';
    if (this.input.wasPressed('Digit2')) this.selectedCharacter = 'klek';
    this.handleMouseMenus();
    if (this.input.wasPressed('KeyP') && this.mode === 'play') this.mode = 'pause'; else if (this.input.wasPressed('KeyP') && this.mode === 'pause') this.mode = 'play';
    if (this.input.wasPressed('Enter')) {
      if (this.mode === 'title') this.mode = 'select';
      else if (this.mode === 'select' || this.mode === 'lose' || this.mode === 'win') { this.startMusic(); this.reset('play'); }
      else if (this.mode === 'pause') this.mode = 'play';
    }
    if (this.mode !== 'play') return;
    if (this.fx.hitStop > 0) { this.fx.update(dt); return; }
    this.director.update(dt, this.enemies, this.player); this.player.update(dt, this.input, this.enemies, this.fx, this.playerBounds());
    for (const enemy of this.enemies) enemy.update(dt, this.player);
    this.separateEnemies();
    this.enemies = this.enemies.filter((enemy) => !enemy.remove); this.fx.update(dt);
    this.updateCamera();
    if (this.player.health <= 0) this.mode = 'lose'; if (this.director.complete) this.mode = 'win';
  }
  draw() {
    const ctx = this.ctx; ctx.clearRect(0, 0, WIDTH, HEIGHT); ctx.save();
    if (this.fx.shake > 0) ctx.translate((Math.random() - 0.5) * this.fx.shake, (Math.random() - 0.5) * this.fx.shake);
    ctx.translate(-this.cameraX, 0);
    this.drawStage(ctx);
    const actors = [this.player, ...this.enemies].sort((a, b) => a.y - b.y); for (const actor of actors) actor.draw(ctx);
    this.fx.draw(ctx); ctx.restore(); drawHud(ctx, this.player, this.director, this.enemies, this.mode, this.selectedCharacter, this.menuButtons(), this.input);
  }

  playerBounds() {
    const stage = this.director.currentStage();
    if (this.director.scrollLocked) return { left: this.director.gateBounds.left + 32, right: this.director.gateBounds.right - 32 };
    return { left: 42, right: stage.worldWidth - 42 };
  }

  updateCamera() {
    const stage = this.director.currentStage();
    const maxCameraX = Math.max(0, stage.worldWidth - WIDTH);
    const target = this.player.x - WIDTH * 0.42;
    this.cameraX = clamp(target, 0, maxCameraX);
  }

  handleMouseMenus() {
    for (const button of this.menuButtons()) {
      if (!this.input.wasClickedIn(button)) continue;
      if (button.action === 'select') this.mode = 'select';
      if (button.action === 'play') { this.startMusic(); this.reset('play'); }
      if (button.action === 'resume') this.mode = 'play';
      if (button.action === 'title') this.reset('title');
      if (button.action === 'khn') this.selectedCharacter = 'khn';
      if (button.action === 'klek') this.selectedCharacter = 'klek';
    }
  }

  startMusic() {
    if (this.musicStarted) return;
    this.musicStarted = true;
    this.music.play().catch(() => { this.musicStarted = false; });
  }

  toggleMusicMuted() {
    this.music.muted = !this.music.muted;
    return this.music.muted;
  }

  menuButtons() {
    if (this.mode === 'title') return [{ x: 370, y: 286, w: 220, h: 48, label: 'Start', action: 'select' }];
    if (this.mode === 'select') return [
      { x: 220, y: 286, w: 240, h: 62, label: 'Khn: Microtonal', action: 'khn', selected: this.selectedCharacter === 'khn' },
      { x: 500, y: 286, w: 240, h: 62, label: 'Klek: Percussion', action: 'klek', selected: this.selectedCharacter === 'klek' },
      { x: 370, y: 380, w: 220, h: 48, label: 'Play', action: 'play' }
    ];
    if (this.mode === 'pause') return [
      { x: 370, y: 286, w: 220, h: 48, label: 'Resume', action: 'resume' },
      { x: 370, y: 346, w: 220, h: 48, label: 'Restart', action: 'play' },
      { x: 370, y: 406, w: 220, h: 48, label: 'Title', action: 'title' }
    ];
    if (this.mode === 'lose' || this.mode === 'win') return [
      { x: 370, y: 306, w: 220, h: 48, label: 'Retry', action: 'play' },
      { x: 370, y: 366, w: 220, h: 48, label: 'Title', action: 'title' }
    ];
    return [];
  }

  separateEnemies() {
    for (let i = 0; i < this.enemies.length; i++) for (let j = i + 1; j < this.enemies.length; j++) {
      const a = this.enemies[i], b = this.enemies[j];
      if (a.state === 'defeated' || b.state === 'defeated') continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      if (Math.abs(dx) < 36 && Math.abs(dy) < 28) { const push = dx >= 0 ? 10 : -10; a.x -= push; b.x += push; a.y -= 4; b.y += 4; a.clampPosition(); b.clampPosition(); }
    }
  }
  drawStage(ctx) {
    const stage = this.director.currentStage();
    const p = stage.palette;
    ctx.fillStyle = p.sky; ctx.fillRect(0, 0, stage.worldWidth, HEIGHT); ctx.fillStyle = p.wall; ctx.fillRect(0, 0, stage.worldWidth, 150);
    ctx.fillStyle = '#111018'; for (let x = 0; x < stage.worldWidth; x += 64) ctx.fillRect(x, 0, 24, 160);
    for (const prop of stage.props) this.drawStageProp(ctx, prop, p);
    ctx.fillStyle = p.floor; ctx.fillRect(0, 300, stage.worldWidth, 190); ctx.fillStyle = p.lane; ctx.fillRect(0, 455, stage.worldWidth, 85);
    ctx.strokeStyle = p.line; for (let y = 320; y <= 450; y += 32) { ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(stage.worldWidth, y); ctx.stroke(); }
    if (this.director.scrollLocked) { const gate = this.director.gateBounds; ctx.globalAlpha = 0.13; ctx.fillStyle = p.sign; ctx.fillRect(gate.left, 300, gate.right - gate.left, 190); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#fff7e0'; ctx.font = '18px system-ui, sans-serif'; ctx.fillText(stage.name, 24, 514); ctx.fillText(stage.subtitle, 24, 536);
  }

  drawStageProp(ctx, prop, palette) {
    ctx.save();
    if (prop.kind === 'pyramid') { ctx.fillStyle = '#8a4f2a'; ctx.beginPath(); ctx.moveTo(prop.x, 292); ctx.lineTo(prop.x + 55, 215); ctx.lineTo(prop.x + 110, 292); ctx.closePath(); ctx.fill(); }
    if (prop.kind === 'triangle') { ctx.globalAlpha = 0.36; ctx.strokeStyle = '#f6e6b8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(prop.x, 284); ctx.lineTo(prop.x + 52, 210); ctx.lineTo(prop.x + 104, 284); ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1; }
    if (prop.kind === 'sign') { ctx.fillStyle = palette.sign; ctx.fillRect(prop.x, 190, 240, 42); ctx.fillStyle = '#111018'; ctx.font = '20px system-ui, sans-serif'; ctx.fillText(prop.text, prop.x + 12, 218); }
    if (prop.kind === 'amp') { ctx.fillStyle = '#111018'; ctx.fillRect(prop.x, 220, 70, 72); ctx.strokeStyle = '#f6e6b8'; ctx.strokeRect(prop.x + 8, 230, 54, 44); ctx.fillStyle = '#4b2e83'; ctx.fillRect(prop.x + 14, 280, 42, 12); }
    if (prop.kind === 'curtain') { ctx.fillStyle = '#9e1b32'; for (let x = prop.x; x < prop.x + 150; x += 30) ctx.fillRect(x, 70, 20, 222); }
    if (prop.kind === 'barricade') { ctx.strokeStyle = '#ffd447'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(prop.x, 286); ctx.lineTo(prop.x + 160, 246); ctx.stroke(); for (let x = prop.x + 12; x < prop.x + 150; x += 28) ctx.fillRect(x, 244, 8, 42); }
    if (prop.kind === 'tent') { ctx.fillStyle = '#f6e6b8'; ctx.beginPath(); ctx.moveTo(prop.x, 292); ctx.lineTo(prop.x + 100, 190); ctx.lineTo(prop.x + 200, 292); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4b2e83'; ctx.fillRect(prop.x + 84, 245, 32, 47); }
    if (prop.kind === 'screen') { ctx.fillStyle = '#111018'; ctx.fillRect(prop.x, 180, 190, 86); ctx.strokeStyle = palette.sign; ctx.strokeRect(prop.x, 180, 190, 86); ctx.fillStyle = palette.sign; ctx.font = '22px system-ui, sans-serif'; ctx.fillText(prop.text, prop.x + 18, 230); }
    ctx.restore();
  }
}
