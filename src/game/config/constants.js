export const WIDTH = 960;
export const HEIGHT = 540;
export const FLOOR_Y = 390;
export const LANE_MIN = 305;
export const LANE_MAX = 455;

export const playerConfigs = {
  khn: {
    id: 'khn', name: 'Khn de Poitrine', role: 'Microtonal guitar fighter', maxHealth: 100,
    moveSpeed: 220, laneSpeed: 150, jumpVelocity: 620, gravity: 1800,
    dashSpeed: 620, dashDuration: 0.16, dashCooldown: 0.55, invulnerableAfterHit: 0.65,
    attacks: {
      light: { damage: 12, startup: 0.08, active: 0.12, recovery: 0.18, width: 72, height: 48, knockback: 180, meter: 15 },
      heavy: { damage: 28, startup: 0.22, active: 0.16, recovery: 0.34, width: 92, height: 58, knockback: 360, meter: 22 },
      special: { damage: 40, startup: 0.16, active: 0.28, recovery: 0.42, width: 150, height: 82, knockback: 520, cost: 100 }
    }
  },
  klek: {
    id: 'klek', name: 'Klek de Poitrine', role: 'Percussion shockwave fighter', maxHealth: 115,
    moveSpeed: 185, laneSpeed: 125, jumpVelocity: 560, gravity: 1800,
    dashSpeed: 520, dashDuration: 0.15, dashCooldown: 0.68, invulnerableAfterHit: 0.75,
    attacks: {
      light: { damage: 14, startup: 0.1, active: 0.14, recovery: 0.22, width: 68, height: 54, knockback: 220, meter: 14 },
      heavy: { damage: 34, startup: 0.3, active: 0.18, recovery: 0.44, width: 100, height: 70, knockback: 440, meter: 24 },
      special: { damage: 46, startup: 0.24, active: 0.3, recovery: 0.5, width: 128, height: 118, knockback: 420, cost: 100 }
    }
  }
};

export const playerConfig = playerConfigs.khn;

export const enemyConfig = {
  maxHealth: 40, moveSpeed: 95, aggroRange: 540, attackRange: 64, attackDamage: 10,
  attackStartup: 0.25, attackActive: 0.14, attackRecovery: 0.55, attackCooldown: 1.0,
  hitstunDuration: 0.35, despawnDelay: 0.4, color: '#27324a', accent: '#ffd447', w: 44, h: 76
};
