import Fruit from './Fruit';
import FruitHalf from './FruitHalf';
import Bomb from './Bomb';
import Blade from './Blade';
import { pickFruit } from './fruits';
import { makeInteriorSprite } from './fruitArt';
import { segmentHitsCircle } from './geometry';
import Explosion from './Explosion';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ===== GAME RULES =====
   - 3 lives (hearts)
   - Fruit bina kate gir jaaye -> 1 life jaati hai (MISS)
   - Bomb kaato -> BOMB_LIFE_COST life jaati hai + explosion, shake, flash
   - Bomb gir jaaye -> koi penalty nahi
   - Lives 0 -> GAME OVER
=============================================== */
const MAX_LIVES = 3;
const BOMB_CHANCE = 0.14;   // har spawn par bomb aane ki sambhavna
const BOMB_LIFE_COST = 1;

// true karoge to mouse hilane se hi trail banega (click zaroori nahi)
const SLICE_ON_HOVER = false;

const BEST_KEY = 'slice-storm:best';

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* private mode mein storage band ho sakta hai */
  }
}

function drawHeart(ctx, cx, cy, s, filled) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.6);
  ctx.bezierCurveTo(-s * 1.1, -s * 0.1, -s * 0.55, -s * 0.85, 0, -s * 0.3);
  ctx.bezierCurveTo(s * 0.55, -s * 0.85, s * 1.1, -s * 0.1, 0, s * 0.6);
  ctx.closePath();
  if (filled) {
    const g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, '#ff7a8c');
    g.addColorStop(1, '#d81b45');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  }
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

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
    this.time = 0;

    this.fps = 0;
    this._frames = 0;
    this._fpsTimer = 0;

    this.blade = new Blade();
    this.best = loadBest();
    this.btn = null;
    this.reset();

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
    this._onKeyDown = (e) => {
      if (this.state === 'gameover' && this.gameOverTimer > 0.6 && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.restart();
      }
    };

    window.addEventListener('resize', this._onResize);
    window.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('visibilitychange', this._onVisibility);
    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointercancel', this._onPointerUp);
    canvas.addEventListener('pointerleave', this._onPointerUp);
    canvas.addEventListener('contextmenu', this._onContextMenu);
    this.resize();
  }

  /* ---------- game state ---------- */

  reset() {
    this.state = 'playing'; // 'playing' | 'gameover'
    this.fruits = [];
    this.bombs = [];
    this.halves = [];
    this.popups = [];
    this.particles = [];
    this.rings = [];
    this.explosions = [];
    this.spawnTimer = 0.6;

    this.blade.end();
    this.blade.points = [];
    this.blade.segments = [];

    this.score = 0;
    this.fruitsSliced = 0;
    this.bombsHit = 0;
    this.lives = MAX_LIVES;

    this.shake = 0;
    this.flash = null;
    this.gameOverTimer = 0;
    this.newBest = false;
    this.btn = null;
  }

  restart() {
    this.reset(); // purane objects, timers aur effects sab saaf
  }

  endGame() {
    if (this.state !== 'playing') return;
    this.state = 'gameover';
    this.gameOverTimer = 0;
    this.blade.end();
    if (this.score > this.best) {
      this.best = this.score;
      this.newBest = true;
      saveBest(this.best);
    }
  }

  /* ---------- input ---------- */

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _inButton(p) {
    const b = this.btn;
    return !!b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
  }

  _onPointerDown(e) {
    const p = this._pos(e);
    if (this.state === 'gameover') {
      if (this.gameOverTimer > 0.6 && this._inButton(p)) this.restart();
      return;
    }
    if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(e.pointerId);
    this.blade.begin(p.x, p.y);
  }

  _onPointerMove(e) {
    if (this.state !== 'playing') return;
    const hover = SLICE_ON_HOVER && e.pointerType === 'mouse';
    if (!this.blade.active && !hover) return;

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
    window.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointercancel', this._onPointerUp);
    this.canvas.removeEventListener('pointerleave', this._onPointerUp);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    this.reset();
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

  /* ---------- spawning ---------- */

  baseSize() {
    return Math.max(22, Math.min(48, Math.min(this.width, this.height) * 0.07));
  }

  // fruit aur bomb dono ki launch physics ek jaisi
  launch(r) {
    const x = rand(this.width * 0.15, this.width * 0.85);
    const y = this.height + r;

    const peak = rand(0.55, 0.85) * this.height;
    const vy = -Math.sqrt(2 * this.gravity * peak);

    const airtime = (2 * Math.abs(vy)) / this.gravity;
    const targetX = rand(this.width * 0.25, this.width * 0.75);
    const vx = (targetX - x) / airtime;
    return { x, y, vx, vy };
  }

  spawnObject() {
    if (Math.random() < BOMB_CHANCE) this.spawnBomb();
    else this.spawnFruit();
  }

  spawnFruit() {
    const type = pickFruit();
    const r = this.baseSize() * type.size;
    const l = this.launch(r);
    this.fruits.push(new Fruit(type, r, l.x, l.y, l.vx, l.vy));
  }

  spawnBomb() {
    const r = this.baseSize();
    const l = this.launch(r);
    this.bombs.push(new Bomb(r, l.x, l.y, l.vx, l.vy));
  }

  /* ---------- slicing ---------- */

  sliceFruit(f, seg) {
    const angle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const push = f.r * 3;
    const interior = makeInteriorSprite(f.type.name, f.r, f.seed);

    for (const side of [0, 1]) {
      const dir = side === 0 ? -1 : 1;
      this.halves.push(
        new FruitHalf(
          f.type, f.r, f.x, f.y,
          f.vx * 0.6 + nx * push * dir,
          f.vy * 0.4 + ny * push * dir,
          angle, side,
          (Math.random() * 2 - 1) * 2 + dir * 2,
          interior
        )
      );
    }

    this.score += f.type.score;
    this.fruitsSliced++;
    this.popups.push({ x: f.x, y: f.y, text: `+${f.type.score}`, life: 0.8, color: '#ffe66d' });
  }

  hitBomb(b) {
    this.bombsHit++;
    this.lives = Math.max(0, this.lives - BOMB_LIFE_COST);
    // this.explode(b.x, b.y);
    // this.shake = 1;
    // this.flash = { color: '#ffffff', alpha: 0.85 };
    this.explosions.push(new Explosion(b.x, b.y, this.baseSize()));
    this.shake = 1;
    this.popups.push({ x: b.x, y: b.y - b.r, text: 'BOMB!', life: 1, color: '#ff5d5d' });
    if (this.lives <= 0) this.endGame();
  }

  missFruit(f) {
    this.lives = Math.max(0, this.lives - 1);
    const x = Math.max(40, Math.min(this.width - 40, f.x));
    this.popups.push({ x, y: this.height - 40, text: 'MISS', life: 1, color: '#ff5d5d' });
    this.flash = { color: '#ff2d55', alpha: 0.22 };
    if (this.lives <= 0) this.endGame();
  }

  explode(x, y) {
    for (let i = 0; i < 46; i++) {
      const a = rand(0, TAU);
      const sp = rand(120, 520);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 80,
        life: rand(0.4, 0.9),
        maxLife: 0.9,
        size: rand(2, 5),
        color: pick(['#ffd166', '#ff9f1c', '#ff5d3a', '#ffffff']),
      });
    }
    this.rings.push({ x, y, life: 0.45, maxLife: 0.45, max: this.baseSize() * 4 });
  }

  checkSlices() {
    const segs = this.blade.takeSegments();
    if (!segs.length || this.state !== 'playing') return;

    const hitBy = (obj, rr) =>
      segs.find((s) => segmentHitsCircle(s.x1, s.y1, s.x2, s.y2, obj.x, obj.y, rr));

    const aliveFruits = [];
    for (const f of this.fruits) {
      const hit = hitBy(f, f.r);
      if (hit) this.sliceFruit(f, hit);
      else aliveFruits.push(f);
    }
    this.fruits = aliveFruits;

    const aliveBombs = [];
    for (const b of this.bombs) {
      const hit = this.state === 'playing' ? hitBy(b, b.r * 0.9) : null;
      if (hit) this.hitBomb(b);
      else aliveBombs.push(b);
    }
    this.bombs = aliveBombs;
  }

  /* ---------- update ---------- */

  update(dt) {
    this.time += dt;

    if (this.state === 'playing') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const count = Math.floor(rand(1, 4));
        for (let i = 0; i < count; i++) this.spawnObject();
        this.spawnTimer = rand(0.9, 1.5);
      }
    } else {
      this.gameOverTimer += dt;
    }

    for (const f of this.fruits) f.update(dt, this.gravity);
    for (const b of this.bombs) b.update(dt, this.gravity);

    // pehle slice check, phir miss check
    this.checkSlices();
    this.blade.takeSegments();

    const stillFruits = [];
    for (const f of this.fruits) {
      if (f.isGone(this.height)) {
        if (this.state === 'playing') this.missFruit(f);
      } else {
        stillFruits.push(f);
      }
    }
    this.fruits = stillFruits;
    this.bombs = this.bombs.filter((b) => !b.isGone(this.height)); // bomb miss = koi penalty nahi

    for (const h of this.halves) h.update(dt, this.gravity);
    this.halves = this.halves.filter((h) => !h.isGone(this.height));

    for (const p of this.popups) {
      p.life -= dt;
      p.y -= 60 * dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);

    for (const p of this.particles) {
      p.life -= dt;
      p.vy += this.gravity * 0.6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const r of this.rings) r.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);

    for(const e of this.explosions) e.update(dt, this.gravity);
    this.explosions = this.explosions.filter((e) => !e.dead);

    this.shake = Math.max(0, this.shake - dt * 2.2);
    if (this.flash) {
      this.flash.alpha -= dt * 2.5;
      if (this.flash.alpha <= 0) this.flash = null;
    }

    this.blade.update(dt);
  }

  /* ---------- render ---------- */

  render() {
    const { ctx, width, height } = this;

    // --- scene (shake sirf isi par lagta hai) ---
    ctx.save();
    if (this.shake > 0) {
      const m = this.shake * 14;
      ctx.translate(rand(-m, m), rand(-m, m));
    }

    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#1b1446');
    g.addColorStop(1, '#0b0a1a');
    ctx.fillStyle = g;
    ctx.fillRect(-20, -20, width + 40, height + 40);

    for (const h of this.halves) h.draw(ctx);
    for (const f of this.fruits) f.draw(ctx);
    for (const b of this.bombs) b.draw(ctx, this.time);
    for (const e of this.explosions) e.draw(ctx);

    for (const rg of this.rings) {
      const t = 1 - rg.life / rg.maxLife;
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2 + 8 * (1 - t);
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.max * t, 0, TAU);
      ctx.stroke();
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.max(18, width * 0.03)}px sans-serif`;
    for (const p of this.popups) {
      ctx.globalAlpha = Math.min(1, p.life / 0.4);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;

    this.blade.draw(ctx);
    ctx.restore();
    for (const e of this.explosions) e.drawFlash(ctx, width, height);

    // --- screen flash ---
    if (this.flash) {
      ctx.globalAlpha = Math.max(0, this.flash.alpha);
      ctx.fillStyle = this.flash.color;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    this.drawHud();
    if (this.state === 'gameover') this.drawGameOver();
  }

  // abhi simple HUD, Step 8 mein React se achha HUD banayenge
  drawHud() {
    const { ctx, width } = this;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(24, width * 0.045)}px sans-serif`;
    ctx.fillText(String(this.score).padStart(6, '0'), width / 2, Math.max(36, width * 0.06));

    const hs = Math.max(11, Math.min(18, width * 0.025));
    for (let i = 0; i < MAX_LIVES; i++) {
      const cx = width - 20 - hs * 1.1 - (MAX_LIVES - 1 - i) * hs * 2.6;
      drawHeart(ctx, cx, 26 + hs * 0.2, hs, i < this.lives);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#9ee493';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${this.fps}`, 12, 22);
  }

  drawGameOver() {
    const { ctx, width: w, height: h } = this;
    const fade = Math.min(1, this.gameOverTimer / 0.4);
    const k = Math.max(0.6, Math.min(1, Math.min(w / 700, h / 560)));
    const cx = w / 2;
    const y0 = h / 2 - 180 * k;

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(8,6,24,0.75)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.font = `bold ${22 * k}px system-ui, sans-serif`;
    ctx.fillStyle = '#4de1ff';
    ctx.fillText('SLICE STORM', cx, y0);

    ctx.font = `bold ${60 * k}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GAME OVER', cx, y0 + 64 * k);

    ctx.font = `${16 * k}px system-ui, sans-serif`;
    ctx.fillStyle = '#9aa3d9';
    ctx.fillText('SCORE', cx, y0 + 112 * k);

    ctx.font = `bold ${54 * k}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffe66d';
    ctx.fillText(String(this.score), cx, y0 + 168 * k);

    if (this.newBest) {
      ctx.font = `bold ${18 * k}px system-ui, sans-serif`;
      ctx.fillStyle = '#7cff8a';
      ctx.fillText('NEW BEST!', cx, y0 + 198 * k);
    }

    const stats = [
      ['BEST', this.best],
      ['FRUITS', this.fruitsSliced],
      ['BOMBS', this.bombsHit],
    ];
    stats.forEach(([label, value], i) => {
      const x = cx + (i - 1) * 150 * k;
      ctx.font = `${14 * k}px system-ui, sans-serif`;
      ctx.fillStyle = '#9aa3d9';
      ctx.fillText(label, x, y0 + 240 * k);
      ctx.font = `bold ${26 * k}px system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(value), x, y0 + 270 * k);
    });

    // PLAY AGAIN button
    const bw = Math.min(320, w * 0.7);
    const bh = Math.max(48, 56 * k);
    const bx = cx - bw / 2;
    const by = y0 + 300 * k;
    this.btn = { x: bx, y: by, w: bw, h: bh };

    ctx.globalAlpha = fade * (this.gameOverTimer > 0.6 ? 1 : 0.4);
    const bg = ctx.createLinearGradient(0, by, 0, by + bh);
    bg.addColorStop(0, '#4de1ff');
    bg.addColorStop(1, '#2a7bff');
    ctx.fillStyle = bg;
    roundedRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fill();

    ctx.fillStyle = '#071029';
    ctx.font = `bold ${22 * k}px system-ui, sans-serif`;
    ctx.fillText('PLAY AGAIN', cx, by + bh / 2 + 8 * k);

    ctx.globalAlpha = fade * 0.7;
    ctx.fillStyle = '#9aa3d9';
    ctx.font = `${13 * k}px system-ui, sans-serif`;
    ctx.fillText('tap the button or press Enter', cx, by + bh + 24 * k);
    ctx.restore();
  }
}