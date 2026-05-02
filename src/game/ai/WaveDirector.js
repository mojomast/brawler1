import { LANE_MAX, LANE_MIN } from '../config/constants.js';
import { Enemy } from '../entities/Enemy.js';
import { stages } from '../levels/stageData.js';
import { clamp } from '../utils/math.js';

export const enemyTypes = {
  algorithm: { label: 'Algorithm Executive', color: '#27324a', accent: '#a4c639', weaponShape: 'phone' },
  curator: { label: 'Playlist Curator', maxHealth: 30, moveSpeed: 125, attackCooldown: 0.75, color: '#4b2e83', accent: '#ff5ca8', bodyShape: 'thin', weaponShape: 'clipboard' },
  consultant: { label: 'Brand Synergy Consultant', maxHealth: 55, attackDamage: 13, color: '#1c355e', accent: '#ffd447', bodyShape: 'wide', weaponShape: 'clipboard' },
  snob: { label: 'Gear Snob', maxHealth: 32, moveSpeed: 74, attackRange: 128, attackStartup: 0.48, attackCooldown: 1.45, color: '#59412c', accent: '#f6e6b8', bodyShape: 'thin', weaponShape: 'cable', tellColor: '#f6e6b8' },
  blogger: { label: 'Nostalgia Blogger', maxHealth: 36, moveSpeed: 78, attackRange: 112, attackStartup: 0.42, attackCooldown: 1.55, retreatRange: 58, color: '#3b3b3b', accent: '#9e1b32', bodyShape: 'slouch', weaponShape: 'phone', tellColor: '#9e1b32' },
  influencer: { label: 'Fake Vinyl Influencer', maxHealth: 28, moveSpeed: 145, attackDamage: 8, attackStartup: 0.18, color: '#5f3153', accent: '#ff5ca8', bodyShape: 'thin', weaponShape: 'ring' },
  purist: { label: 'Indie Purist', maxHealth: 48, attackCooldown: 0.9, color: '#202020', accent: '#fff7e0', bodyShape: 'tall', weaponShape: 'record' },
  merch: { label: 'Merch Cut Manager', maxHealth: 62, moveSpeed: 72, attackDamage: 16, attackStartup: 0.38, color: '#8a4f2a', accent: '#ffd447', bodyShape: 'wide', weaponShape: 'box' }
};

export const bossTypes = {
  promoter: { label: 'Arena Promoter', isBoss: true, maxHealth: 170, w: 70, h: 112, moveSpeed: 68, attackDamage: 17, attackRange: 86, color: '#9e1b32', accent: '#ffd447', weaponShape: 'megaphone', phaseAdds: ['influencer', 'curator'], phaseMods: [{}, { moveSpeed: 1.08, attackCooldown: 0.88, attackDamage: 2 }, { moveSpeed: 1.18, attackCooldown: 0.78, attackDamage: 4 }] },
  hydra: { label: 'Content Mill Hydra', isBoss: true, maxHealth: 210, w: 86, h: 122, moveSpeed: 62, attackDamage: 19, attackRange: 120, color: '#4b2e83', accent: '#a4c639', weaponShape: 'hydra', phaseAdds: ['algorithm', 'blogger'], phaseMods: [{}, { moveSpeed: 1, attackCooldown: 0.86, attackDamage: 3 }, { moveSpeed: 1.08, attackCooldown: 0.74, attackDamage: 6 }] },
  executive: { label: 'Grand Executive of Palatability', isBoss: true, maxHealth: 260, w: 92, h: 132, moveSpeed: 58, attackDamage: 22, attackRange: 96, color: '#111018', accent: '#ff5ca8', bodyShape: 'wide', weaponShape: 'clipboard', phaseAdds: ['consultant', 'merch'], phaseMods: [{}, { moveSpeed: 1.12, attackCooldown: 0.84, attackDamage: 4 }, { moveSpeed: 1.2, attackCooldown: 0.72, attackDamage: 7 }] }
};

export class WaveDirector {
  constructor(stageIndex = 0) { this.stage = stageIndex; this.encounterIndex = 0; this.activeEncounter = null; this.complete = false; this.lastStageTitle = 2.2; }
  get pending() { return this.activeEncounter ? 0 : Math.max(0, this.currentStage().encounters.length - this.encounterIndex); }
  get waves() { return this.currentStage().encounters; }
  get wave() { return this.encounterIndex + (this.activeEncounter ? 1 : 0); }
  get scrollLocked() { return Boolean(this.activeEncounter); }
  get gateBounds() { return this.activeEncounter?.gate || { left: 42, right: this.currentStage().worldWidth - 42 }; }
  currentStage() { return stages[this.stage] || stages[stages.length - 1]; }

  update(dt, enemies, player) {
    if (this.complete) return;
    this.lastStageTitle = Math.max(0, this.lastStageTitle - dt);
    this.spawnBossAdds(enemies, player);
    if (this.activeEncounter) { if (enemies.length === 0) this.clearEncounter(player); return; }
    const encounter = this.currentStage().encounters[this.encounterIndex];
    if (encounter && player.x >= encounter.triggerX) this.startEncounter(encounter, enemies, player);
    else if (!encounter && player.x >= this.currentStage().exitX) this.advanceStage(player, enemies);
  }

  startEncounter(encounter, enemies, player) {
    this.activeEncounter = encounter;
    const bounds = { left: encounter.gate.left + 48, right: encounter.gate.right - 48 };
    for (const spawn of encounter.enemies) {
      const isBoss = spawn.type.startsWith('boss:');
      const type = isBoss ? bossTypes[spawn.type.slice(5)] : enemyTypes[spawn.type];
      const targetX = spawn.x ?? clamp(player.x + (spawn.fromPlayerX || 220), bounds.left, bounds.right);
      const entrySide = targetX < player.x ? -1 : 1;
      const entryX = clamp(targetX + entrySide * 130, bounds.left, bounds.right);
      enemies.push(new Enemy(entryX, spawn.y, { ...type, entryState: 'entering', targetX, bounds }));
    }
  }

  clearEncounter(player) { this.encounterIndex++; this.activeEncounter = null; player.x += 22; }

  advanceStage(player, enemies) {
    this.stage++; this.encounterIndex = 0; this.activeEncounter = null; this.lastStageTitle = 2.2; enemies.length = 0;
    if (!stages[this.stage]) { this.complete = true; return; }
    player.x = stages[this.stage].playerStart?.x || 220; player.y = stages[this.stage].playerStart?.y || 390;
  }

  spawnBossAdds(enemies, player) {
    const boss = enemies.find((enemy) => enemy.config.isBoss && enemy.summonReady && enemy.state !== 'defeated');
    if (!boss) return;
    boss.summonReady = false;
    const add = boss.config.phaseAdds?.[boss.phase - 2] || (boss.phase === 2 ? 'curator' : 'algorithm');
    const gate = this.gateBounds;
    const x = clamp(player.x + (boss.x > player.x ? -240 : 240), gate.left + 70, gate.right - 70);
    const y = clamp(player.y + (boss.phase === 2 ? -38 : 38), LANE_MIN, LANE_MAX);
    enemies.push(new Enemy(x, y, { ...enemyTypes[add], entryState: 'entering', targetX: clamp(player.x + (boss.x > player.x ? -130 : 130), gate.left + 70, gate.right - 70), bounds: { left: gate.left + 48, right: gate.right - 48 } }));
  }
}

export { stages };
