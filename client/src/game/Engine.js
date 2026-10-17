export default class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.running = false;
    this.rafId = null;
    this.lastTime = 0;

    this.fps = 0;
    this._frames = 0;
    this._fpsTimer = 0;

    // Test ball
    this.ball = { x: 100, y: 100, vx: 220, vy: 160, r: 24 };

    this._loop = this._loop.bind(this);
    this._onResize = this.resize.bind(this);
    this._onVisibility = () => (document.hidden ? this.stop() : this.start());

    window.addEventListener('resize', this._onResize);
    document.addEventListener('visibilitychange', this._onVisibility);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // keep the ball inside the canvas
    const r = this.ball.r;
    this.ball.x = Math.max(r, Math.min(this.ball.x, this.width - r));
    this.ball.y = Math.max(r, Math.min(this.ball.y, this.height - r));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibility);
  }

  _loop(now) {
    if (!this.running) return;
    const raw = (now - this.lastTime) / 1000;
    const dt = Math.min(raw, 0.05); // lambe gap par jump na ho
    this.lastTime = now;

    this._frames++;
    this._fpsTimer += raw;
    if (this._fpsTimer >= 0.5) {
      this.fps = Math.round(this._frames / this._fpsTimer);
      this._frames = 0;
      this._fpsTimer = 0;
    }

    this.update(dt);
    this.render();
    this.rafId = requestAnimationFrame(this._loop);
  }

    update(dt) {
    const b = this.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < b.r) {
      b.x = b.r;
      b.vx = Math.abs(b.vx);       // seedha right ki taraf
    } else if (b.x > this.width - b.r) {
      b.x = this.width - b.r;
      b.vx = -Math.abs(b.vx);      // seedha left ki taraf
    }

    if (b.y < b.r) {
      b.y = b.r;
      b.vy = Math.abs(b.vy);
    } else if (b.y > this.height - b.r) {
      b.y = this.height - b.r;
      b.vy = -Math.abs(b.vy);
    }
  }

  render() {
    const { ctx, width, height } = this;

    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#1b1446');
    g.addColorStop(1, '#0b0a1a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7a3d';
    ctx.fill();

    ctx.fillStyle = '#9ee493';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${this.fps}`, 12, 22);
  }
}