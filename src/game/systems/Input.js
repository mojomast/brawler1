export class Input {
  constructor(canvas) {
    this.down = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    window.addEventListener('keydown', (event) => {
      if (!this.down.has(event.code)) this.pressed.add(event.code);
      this.down.add(event.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    });
    window.addEventListener('keyup', (event) => this.down.delete(event.code));
    canvas.addEventListener('mousemove', (event) => this.updateMouse(event, canvas));
    canvas.addEventListener('mousedown', (event) => { this.updateMouse(event, canvas); this.mouse.down = true; this.mouse.clicked = true; });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
  }

  isDown(...codes) { return codes.some((code) => this.down.has(code)); }
  wasPressed(...codes) { return codes.some((code) => this.pressed.has(code)); }
  wasClickedIn(rect) { return this.mouse.clicked && this.mouse.x >= rect.x && this.mouse.x <= rect.x + rect.w && this.mouse.y >= rect.y && this.mouse.y <= rect.y + rect.h; }
  isHovering(rect) { return this.mouse.x >= rect.x && this.mouse.x <= rect.x + rect.w && this.mouse.y >= rect.y && this.mouse.y <= rect.y + rect.h; }
  endFrame() { this.pressed.clear(); this.mouse.clicked = false; }

  updateMouse(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    this.mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  }
}
