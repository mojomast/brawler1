export class Particles {
  constructor() { this.items = []; this.hitStop = 0; this.shake = 0; }
  burst(x, y, kind, isBoss = false) {
    const color = kind === 'special' ? '#a4c639' : kind === 'heavy' ? '#ffd447' : '#ff5ca8';
    for (let i = 0; i < 10; i++) this.items.push({ x, y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.7) * 220, life: 0.35, color, kind });
    this.hitStop = Math.max(this.hitStop, isBoss ? 0.08 : kind === 'special' ? 0.07 : kind === 'heavy' ? 0.055 : 0.035);
    this.shake = Math.max(this.shake, isBoss ? 9 : kind === 'special' ? 7 : kind === 'heavy' ? 5 : 3);
  }
  update(dt) { this.hitStop = Math.max(0, this.hitStop - dt); this.shake = Math.max(0, this.shake - 24 * dt); for (const p of this.items) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; } this.items = this.items.filter((p) => p.life > 0); }
  draw(ctx) {
    for (const p of this.items) {
      ctx.globalAlpha = Math.max(0, p.life / 0.35); ctx.strokeStyle = p.color; ctx.fillStyle = p.color; ctx.lineWidth = 2;
      if (p.kind === 'heavy') ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
      else if (p.kind === 'special') { ctx.beginPath(); ctx.moveTo(p.x - 7, p.y); ctx.lineTo(p.x, p.y - 7); ctx.lineTo(p.x + 7, p.y); ctx.lineTo(p.x, p.y + 7); ctx.closePath(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(p.x - 7, p.y + 5); ctx.lineTo(p.x + 7, p.y - 5); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
}
