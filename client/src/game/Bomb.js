const TAU = Math.PI * 2;
const S = 2; // sprite resolution (retina screens par saaf dikhne ke liye)
const cache = new Map();

// fuse ka sira (bomb ke radius r ke hisaab se), spark yahin jalti hai
const TIP = { x: 0.62, y: -1.62 };

// seed se same random numbers milte hain, isliye bomb ka design har frame same rehta hai
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// bezier curve ka point aur direction (fuse ki rassi banane ke liye)
function bez(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, a: Math.atan2(dy, dx) };
}

function buildSprite(r) {
  const size = r * 3.4;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.ceil(size * S);
  const ctx = canvas.getContext('2d');
  ctx.scale(S, S);
  ctx.translate(size / 2, size / 2);
  const rand = rng(Math.round(r) * 7919);

  /* ---------- lohe ka gola ---------- */
  let g = ctx.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.05, -r * 0.1, -r * 0.1, r * 1.2);
  g.addColorStop(0, '#9aa0b3');
  g.addColorStop(0.14, '#555b6d');
  g.addColorStop(0.45, '#20222c');
  g.addColorStop(0.82, '#0b0c11');
  g.addColorStop(1, '#030305');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();

  // neeche-daayen se aati neeli bounce light
  g = ctx.createRadialGradient(r * 0.55, r * 0.65, 0, r * 0.55, r * 0.65, r * 0.95);
  g.addColorStop(0, 'rgba(110,150,255,0.38)');
  g.addColorStop(1, 'rgba(110,150,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  // lohe par khareenchein (scratches)
  for (let i = 0; i < 26; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * r * 0.95;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const ang = rand() * TAU;
    const len = r * (0.06 + rand() * 0.18);
    ctx.strokeStyle = rand() > 0.4 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.8 + rand() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }

  /* ---------- beech ki dhaatu ki patti (belt) + rivets ---------- */
  const band = () => {
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, -r * 0.18);
    ctx.quadraticCurveTo(0, -r * 0.04, r * 1.05, -r * 0.18);
    ctx.lineTo(r * 1.05, r * 0.06);
    ctx.quadraticCurveTo(0, r * 0.2, -r * 1.05, r * 0.06);
    ctx.closePath();
  };
  band();
  g = ctx.createLinearGradient(0, -r * 0.2, 0, r * 0.2);
  g.addColorStop(0, '#7a8196');
  g.addColorStop(0.35, '#444a5c');
  g.addColorStop(0.7, '#262935');
  g.addColorStop(1, '#14151c');
  ctx.fillStyle = g;
  ctx.fill();

  // patti ke kinaron par andhera, taaki gole par lipti hui lage
  g = ctx.createLinearGradient(-r, 0, r, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.65)');
  g.addColorStop(0.3, 'rgba(0,0,0,0)');
  g.addColorStop(0.7, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.65)');
  band();
  ctx.fillStyle = g;
  ctx.fill();

  // patti ki upar-neeche ki chamakti kinari
  ctx.strokeStyle = 'rgba(190,200,230,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, -r * 0.18);
  ctx.quadraticCurveTo(0, -r * 0.04, r * 1.05, -r * 0.18);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, r * 0.06);
  ctx.quadraticCurveTo(0, r * 0.2, r * 1.05, r * 0.06);
  ctx.stroke();

  // rivets
  for (const xr of [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78]) {
    const x = xr * r;
    const t = (xr + 1) / 2;
    const u = 1 - t;
    const y = (u * u * -0.06 + 2 * u * t * 0.08 + t * t * -0.06) * r;
    const rr = r * 0.034;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.arc(x + rr * 0.25, y + rr * 0.35, rr * 1.15, 0, TAU);
    ctx.fill();
    const rg = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, 0, x, y, rr * 1.1);
    rg.addColorStop(0, '#d9deee');
    rg.addColorStop(1, '#4a5063');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, TAU);
    ctx.fill();
  }

  // upar-baayen ki badi chamak + ek chhoti tez chamak
  g = ctx.createRadialGradient(-r * 0.42, -r * 0.5, 0, -r * 0.42, -r * 0.5, r * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.5, 'rgba(210,225,255,0.16)');
  g.addColorStop(1, 'rgba(210,225,255,0)');
  ctx.save();
  ctx.translate(-r * 0.42, -r * 0.5);
  ctx.rotate(-0.75);
  ctx.scale(1, 0.62);
  ctx.translate(r * 0.42, r * 0.5);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(-r * 0.42, -r * 0.5, r * 0.5, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.5, -r * 0.55, r * 0.07, r * 0.045, -0.75, 0, TAU);
  ctx.fill();

  // kinaron par halka rim-light
  ctx.strokeStyle = 'rgba(150,175,255,0.2)';
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.975, -0.2, 1.6);
  ctx.stroke();
  ctx.restore();

  /* ---------- peetal ka collar (upar) ---------- */
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.93, r * 0.34, r * 0.1, 0, 0, TAU);
  ctx.fill();

  g = ctx.createLinearGradient(-r * 0.24, 0, r * 0.24, 0);
  g.addColorStop(0, '#5b3a10');
  g.addColorStop(0.25, '#c8903a');
  g.addColorStop(0.45, '#fff0b8');
  g.addColorStop(0.7, '#b57a22');
  g.addColorStop(1, '#4a2d0a');
  ctx.fillStyle = g;
  ctx.fillRect(-r * 0.24, -r * 1.2, r * 0.48, r * 0.3);

  // collar ke ring
  ctx.strokeStyle = 'rgba(60,35,5,0.65)';
  ctx.lineWidth = 1.3;
  for (const yy of [-1.09, -0.99]) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, yy * r);
    ctx.lineTo(r * 0.24, yy * r);
    ctx.stroke();
  }

  // upar ka lip
  g = ctx.createLinearGradient(-r * 0.3, 0, r * 0.3, 0);
  g.addColorStop(0, '#4a2d0a');
  g.addColorStop(0.35, '#e8b552');
  g.addColorStop(0.5, '#fff4cc');
  g.addColorStop(1, '#5b3a10');
  ctx.fillStyle = g;
  ctx.fillRect(-r * 0.3, -r * 1.27, r * 0.6, r * 0.1);
  ctx.fillStyle = '#1a0f03';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.27, r * 0.12, r * 0.035, 0, 0, TAU);
  ctx.fill();

  /* ---------- fuse (muda hui rassi) ---------- */
  const p0 = [0, -r * 1.25];
  const p1 = [r * 0.02, -r * 1.55];
  const p2 = [r * 0.5, -r * 1.32];
  const p3 = [TIP.x * r, TIP.y * r];
  const N = 22;

  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2c1d0d';
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
  ctx.stroke();

  ctx.strokeStyle = '#b08a52';
  ctx.lineWidth = r * 0.105;
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
  ctx.stroke();

  // rassi ke twist wale nishaan
  for (let i = 0; i < N; i++) {
    const q = bez((i + 0.5) / N, p0, p1, p2, p3);
    const burnt = i > N - 4;
    ctx.strokeStyle = burnt ? 'rgba(20,10,0,0.8)' : 'rgba(70,45,15,0.75)';
    ctx.lineWidth = r * 0.03;
    const half = r * 0.06;
    const ang = q.a + 1.0;
    ctx.beginPath();
    ctx.moveTo(q.x - Math.cos(ang) * half, q.y - Math.sin(ang) * half);
    ctx.lineTo(q.x + Math.cos(ang) * half, q.y + Math.sin(ang) * half);
    ctx.stroke();
  }
  // jala hua kaala sira
  ctx.fillStyle = '#140a02';
  ctx.beginPath();
  ctx.arc(p3[0], p3[1], r * 0.07, 0, TAU);
  ctx.fill();

  return { canvas, size };
}

function getSprite(r) {
  const key = Math.round(r);
  if (!cache.has(key)) cache.set(key, buildSprite(r));
  return cache.get(key);
}

export default class Bomb {
  constructor(r, x, y, vx, vy) {
    this.isBomb = true;
    this.r = r;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = Math.random() * TAU;
    this.spin = (Math.random() * 2 - 1) * 2;
    this.seed = Math.random() * 10;
    this.sprite = getSprite(r);
  }

  update(dt, gravity) {
    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.spin * dt;
  }

  isGone(height) {
    return this.y - this.r > height && this.vy > 0;
  }

  draw(ctx, t) {
    const { r, sprite } = this;

    ctx.save();
    ctx.translate(this.x, this.y);

    // khatre ki laal dhadakti roshni (taaki bomb door se pehchaan mein aaye)
    const pulse = 0.5 + 0.5 * Math.sin(t * 7 + this.seed);
    const glow = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.9);
    glow.addColorStop(0, `rgba(255,50,40,${0.1 + 0.16 * pulse})`);
    glow.addColorStop(1, 'rgba(255,50,40,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(this.angle);
    ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
    ctx.restore();

    // chingari ki position (bomb ghoomta hai, to sira bhi ghoomta hai)
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    const lx = TIP.x * r;
    const ly = TIP.y * r;
    this.drawSpark(ctx, this.x + lx * c - ly * s, this.y + lx * s + ly * c, t);
  }

  drawSpark(ctx, tx, ty, t) {
    const { r } = this;
    const flick = 0.72 + 0.28 * Math.sin(t * 41 + this.seed * 3) * Math.sin(t * 23 + this.seed);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // badi naram roshni
    const sr = r * 0.62 * flick;
    let g = ctx.createRadialGradient(tx, ty, 0, tx, ty, sr);
    g.addColorStop(0, 'rgba(255,240,190,0.95)');
    g.addColorStop(0.3, 'rgba(255,170,50,0.6)');
    g.addColorStop(1, 'rgba(255,90,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(tx, ty, sr, 0, Math.PI * 2);
    ctx.fill();

    // chamakta safed centre
    ctx.fillStyle = 'rgba(255,255,235,0.95)';
    ctx.beginPath();
    ctx.arc(tx, ty, r * 0.07 * flick, 0, Math.PI * 2);
    ctx.fill();

    // udti hui chingariyaan
    for (let i = 0; i < 6; i++) {
      const ph = (t * 2.6 + i / 6 + this.seed) % 1;
      const ang = -Math.PI / 2 + (i - 2.5) * 0.5 + Math.sin(i * 12.9898 + this.seed) * 0.25;
      const dist = ph * r * 0.95;
      const x = tx + Math.cos(ang) * dist;
      const y = ty + Math.sin(ang) * dist + ph * ph * r * 0.5;
      ctx.fillStyle = `rgba(255,${190 - ph * 70 | 0},70,${1 - ph})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.036 * (1 - ph * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}