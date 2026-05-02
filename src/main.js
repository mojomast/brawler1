import { GameScene } from './game/scenes/GameScene.js';

const canvas = document.querySelector('#game');
const rotateOverlay = document.querySelector('#rotate-overlay');
const touchLayer = document.querySelector('#touch-layer');
const muteButton = document.querySelector('#mute-button');
const touchOverride = new URLSearchParams(window.location.search).get('touch');
const activeVirtualCodes = new Set();
const game = new GameScene(canvas);
game.start();

function isMobile() {
  if (touchOverride === '1') return true;
  if (touchOverride === '0') return false;
  return navigator.userAgentData?.mobile === true || /Mobi|Android/i.test(navigator.userAgent) || window.matchMedia?.('(pointer: coarse)').matches === true;
}

function releaseAllVirtualControls() {
  for (const code of activeVirtualCodes) game.input.releaseVirtual(code);
  activeVirtualCodes.clear();
  for (const button of touchLayer.querySelectorAll('.active')) button.classList.remove('active');
}

function updateMobileLayout() {
  const mobile = isMobile();
  const landscape = window.innerWidth >= window.innerHeight;
  const controlsVisible = mobile && landscape;
  document.body.classList.toggle('mobile', mobile);
  document.body.classList.toggle('mobile-landscape', controlsVisible);
  document.body.classList.toggle('mobile-portrait', mobile && !landscape);
  rotateOverlay.hidden = !(mobile && !landscape);
  rotateOverlay.setAttribute('aria-hidden', String(!(mobile && !landscape)));
  touchLayer.hidden = !controlsVisible;
  touchLayer.setAttribute('aria-hidden', String(!controlsVisible));
  if (!controlsVisible) releaseAllVirtualControls();
}

function buildTouchControls() {
  touchLayer.innerHTML = `
    <div class="touch-pad" aria-label="Movement controls">
      <button class="touch-button dpad touch-up" data-code="ArrowUp" aria-label="Move up">Up</button>
      <button class="touch-button dpad touch-down" data-code="ArrowDown" aria-label="Move down">Down</button>
      <button class="touch-button dpad touch-left" data-code="ArrowLeft" aria-label="Move left">Left</button>
      <button class="touch-button dpad touch-right" data-code="ArrowRight" aria-label="Move right">Right</button>
    </div>
    <div class="touch-actions" aria-label="Action controls">
      <button class="touch-button touch-pause" data-code="KeyP" aria-label="Pause">Pause</button>
      <button class="touch-button touch-jump" data-code="Space" aria-label="Jump">Jump</button>
      <button class="touch-button touch-dash" data-code="ShiftLeft" aria-label="Dash">Dash</button>
      <button class="touch-button touch-light" data-code="KeyJ" aria-label="Light attack">Light</button>
      <button class="touch-button touch-heavy" data-code="KeyK" aria-label="Heavy attack">Heavy</button>
      <button class="touch-button touch-special" data-code="KeyL" aria-label="Special attack">Special</button>
    </div>
  `;
  for (const button of touchLayer.querySelectorAll('[data-code]')) {
    const code = button.dataset.code;
    const press = (event) => { event.preventDefault(); button.classList.add('active'); button.setPointerCapture?.(event.pointerId); activeVirtualCodes.add(code); game.input.pressVirtual(code); };
    const release = (event) => { event.preventDefault(); button.classList.remove('active'); activeVirtualCodes.delete(code); game.input.releaseVirtual(code); };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }
}

buildTouchControls();
updateMobileLayout();
muteButton.addEventListener('click', () => {
  const muted = game.toggleMusicMuted();
  muteButton.textContent = muted ? 'Music Off' : 'Music On';
  muteButton.classList.toggle('is-muted', muted);
  muteButton.setAttribute('aria-pressed', String(muted));
});
window.addEventListener('resize', updateMobileLayout);
window.addEventListener('orientationchange', updateMobileLayout);
