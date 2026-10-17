import Fruit from './Fruit';
import Blade from './Blade';
import { pickFruit } from './fruits';

const rand = (a, b) => a + Math.random() * (b - a);

// true karoge to mouse hilane se hi trail banega (click zaroori nahi)
const SLICE_ON_HOVER = false;

export default class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.gravity = 0;

    this.running = false;
    this.rafId = null;
    this.lastTime = 0;

    this.fps = 0;
    this._frames = 0;
    this._fpsTimer = 0;

    this.fruits = [];
    this.spawnTimer = 0.3;
    this.blade = new Blade();

    this._loop = this._loop.bind(this);
    this._onResize = this.resize.bind(this);
    this._onVisibility = () => {
      if (document.hidden) {
        this.blade.end();
        this.stop();
      } else {
        this.start();
      }
    };
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    window.addEventListener('resize', this._onResize);
    document.addEventListener('visibilitychange', this._onVisibility);
    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointercancel', this._onPointerUp);
    canvas.addEventListener('pointerleave', this._onPointerUp);
    canvas.addEventListener('contextmenu', this._onContextMenu);
    this.resize();
  }

  /* ---------- input ---------- */

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _onPointerDown(e) {
    if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(e.pointerId);
    const p = this._pos(e);
    this.blade.begin(p.x, p.y);
  }

  _onPointerMove(e) {
    const hover = SLICE_ON_HOVER && e.pointerType === 'mouse';
    if (!this.blade.active && !hover) return;

    // tez swipe mein browser beech ke points jod deta hai, taaki trail tootey nahi
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const events = list.length ? list : [e];

    for (const ev of events) {
      const p = this._pos(ev);
      if (!this.blade.active) this.blade.begin(p.x, p.y);
      else this.blade.move(p.x, p.y);
    }
  }

  _onPointerUp() {
    this.blade.end();
  }

  /* ---------- setup ---------- */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.gravity = this.height * 1.5;
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
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointercancel', this._onPointerUp);
    this.canvas.removeEventListener('pointerleave', this._onPointerUp);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    this.fruits = [];
    this.blade.points = [];
  }

  /* ---------- loop ---------- */

  _loop(now) {
    if (!this.running) return;
    const raw = (now - this.lastTime) / 1000;
    const dt = Math.min(raw, 0.05);
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

  spawnFruit() {
    const type = pickFruit();
    const base = Math.max(22, Math.min(48, Math.min(this.width, this.height) * 0.07));
    const r = base * type.size;

    const x = rand(this.width * 0.15, this.width * 0.85);
    const y = this.height + r;

    const peak = rand(0.55, 0.85) * this.height;
    const vy = -Math.sqrt(2 * this.gravity * peak);

    const airtime = (2 * Math.abs(vy)) / this.gravity;
    const targetX = rand(this.width * 0.25, this.width * 0.75);
    const vx = (targetX - x) / airtime;

    this.fruits.push(new Fruit(type, r, x, y, vx, vy));
  }

  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const count = Math.floor(rand(1, 4));
      for (let i = 0; i < count; i++) this.spawnFruit();
      this.spawnTimer = rand(0.9, 1.5);
    }

    for (const f of this.fruits) f.update(dt, this.gravity);
    this.fruits = this.fruits.filter((f) => !f.isGone(this.height));

    this.blade.update(dt);
  }

  render() {
    const { ctx, width, height } = this;

    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#1b1446');
    g.addColorStop(1, '#0b0a1a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    for (const f of this.fruits) f.draw(ctx);
    this.blade.draw(ctx); // trail sabse upar

    ctx.fillStyle = '#9ee493';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${this.fps}  Fruits: ${this.fruits.length}`, 12, 22);
  }
}