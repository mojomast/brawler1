export const stages = [
  {
    id: 'basement', name: 'Basement Rehearsal Catacombs', subtitle: 'Cables, cardboard pyramids, and amp dust.', worldWidth: 2600, exitX: 2480,
    palette: { sky: '#1c355e', wall: '#9e1b32', floor: '#8a4f2a', lane: '#4b2e83', line: '#f6e6b8', sign: '#ffd447' },
    props: [{ kind: 'amp', x: 350 }, { kind: 'triangle', x: 560 }, { kind: 'pyramid', x: 740 }, { kind: 'sign', x: 1130, text: 'HOT DOG PYRAMID ROCK' }, { kind: 'curtain', x: 1640 }, { kind: 'amp', x: 1940 }],
    encounters: [
      { id: 'amp-door', triggerX: 520, gate: { left: 410, right: 930 }, enemies: [{ type: 'algorithm', x: 720, y: 350 }, { type: 'curator', x: 850, y: 420 }] },
      { id: 'cable-pit', triggerX: 1180, gate: { left: 1040, right: 1560 }, enemies: [{ type: 'algorithm', x: 1360, y: 330 }, { type: 'curator', x: 1470, y: 390 }, { type: 'influencer', x: 1260, y: 440 }] },
      { id: 'promoter', triggerX: 2020, gate: { left: 1900, right: 2460 }, enemies: [{ type: 'boss:promoter', x: 2260, y: 386 }] }
    ]
  },
  {
    id: 'festival', name: 'Festival Backstage Labyrinth', subtitle: 'Badges, barricades, fake smiles, worse maps.', worldWidth: 2800, exitX: 2680,
    palette: { sky: '#18342f', wall: '#59412c', floor: '#5f4b32', lane: '#27324a', line: '#ffd447', sign: '#a4c639' },
    props: [{ kind: 'barricade', x: 420 }, { kind: 'sign', x: 900, text: 'ARTIST WRISTBANDS?' }, { kind: 'tent', x: 1420 }, { kind: 'triangle', x: 1720 }, { kind: 'barricade', x: 1900 }, { kind: 'pyramid', x: 2360 }],
    encounters: [
      { id: 'lanyard-check', triggerX: 560, gate: { left: 460, right: 1040 }, enemies: [{ type: 'consultant', x: 760, y: 350 }, { type: 'curator', x: 910, y: 416 }, { type: 'influencer', x: 620, y: 446 }] },
      { id: 'gear-table', triggerX: 1320, gate: { left: 1220, right: 1780 }, enemies: [{ type: 'snob', x: 1550, y: 330 }, { type: 'consultant', x: 1660, y: 390 }, { type: 'curator', x: 1380, y: 440 }] },
      { id: 'merch-alley', triggerX: 2140, gate: { left: 2040, right: 2620 }, enemies: [{ type: 'algorithm', x: 2260, y: 350 }, { type: 'merch', x: 2460, y: 386 }, { type: 'influencer', x: 2340, y: 438 }] }
    ]
  },
  {
    id: 'streaming', name: 'Streaming Tower', subtitle: 'An elevator of metrics ascending into nonsense.', worldWidth: 2900, exitX: 2780,
    palette: { sky: '#101827', wall: '#1c355e', floor: '#27324a', lane: '#111018', line: '#a4c639', sign: '#ff5ca8' },
    props: [{ kind: 'screen', x: 420, text: 'SKIP RATE' }, { kind: 'screen', x: 980, text: '+0.004%' }, { kind: 'pyramid', x: 1460 }, { kind: 'triangle', x: 1760 }, { kind: 'screen', x: 1960, text: 'CONTENT' }, { kind: 'curtain', x: 2380 }],
    encounters: [
      { id: 'metrics', triggerX: 620, gate: { left: 500, right: 1100 }, enemies: [{ type: 'algorithm', x: 760, y: 332 }, { type: 'algorithm', x: 930, y: 390 }, { type: 'blogger', x: 1020, y: 440 }] },
      { id: 'long-tail', triggerX: 1430, gate: { left: 1320, right: 1900 }, enemies: [{ type: 'snob', x: 1720, y: 330 }, { type: 'blogger', x: 1560, y: 395 }, { type: 'consultant', x: 1830, y: 440 }] },
      { id: 'hydra', triggerX: 2260, gate: { left: 2140, right: 2720 }, enemies: [{ type: 'boss:hydra', x: 2480, y: 386 }] }
    ]
  },
  {
    id: 'anti-arena', name: 'The Anti-Arena', subtitle: 'No pyrotechnics survived the budget meeting.', worldWidth: 3000, exitX: 2880,
    palette: { sky: '#111018', wall: '#4b2e83', floor: '#8a4f2a', lane: '#9e1b32', line: '#f6e6b8', sign: '#ffd447' },
    props: [{ kind: 'curtain', x: 360 }, { kind: 'sign', x: 820, text: 'NO ENCORE CLAUSE' }, { kind: 'triangle', x: 1120 }, { kind: 'amp', x: 1320 }, { kind: 'pyramid', x: 1860 }, { kind: 'sign', x: 2340, text: 'PALATABILITY' }],
    encounters: [
      { id: 'purity-test', triggerX: 660, gate: { left: 540, right: 1160 }, enemies: [{ type: 'purist', x: 820, y: 350 }, { type: 'merch', x: 980, y: 386 }, { type: 'snob', x: 1100, y: 440 }] },
      { id: 'brand-collapse', triggerX: 1500, gate: { left: 1380, right: 2040 }, enemies: [{ type: 'algorithm', x: 1580, y: 330 }, { type: 'consultant', x: 1760, y: 390 }, { type: 'influencer', x: 1910, y: 438 }, { type: 'blogger', x: 1980, y: 350 }] },
      { id: 'palatable', triggerX: 2380, gate: { left: 2260, right: 2920 }, enemies: [{ type: 'boss:executive', x: 2700, y: 386 }] }
    ]
  }
];
