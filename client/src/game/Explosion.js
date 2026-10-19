const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const LIFE = 1.9; // poora effect itne second mein khatam

// aag ka gola: andar safed-peela, bahar narangi aur laal
function fireGradient(ctx, x, y, r, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,240,${a})`);
  g.addColorStop(0.18, `rgba(255,226,130,${a})`);
  g.addColorStop(0.45, `rgba(255,140,30,${a * 0.9})`);
  g.addColorStop(0.75, `rgba(200,55,10,${a * 0.5})`);
  g.addColorStop(1, 'rgba(120,20,0,0)');
  return g;
}

export default class Explosion {
  // size = bomb ka radius, taaki chhoti aur badi screens par effect ka size theek rahe
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.R = size;
    this.t = 0;
    this.dead = false;
    const R = size;

    // aag ke chhote gole
    this.blobs = Array.from({ length: 8 }, () => {
      const a = rand(0, TAU);
      const d = rand(0.2, 1.3) * R;
      return {
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        r: rand(1.1, 2.0) * R,
        delay: rand(0, 0.12),
        life: rand(0.35, 0.6),
      };
    });

    // chingariyaan (lambi lakeer ke saath)
    this.sparks = Array.from({ length: 42 }, () => {
      const a = rand(0, TAU);
      const sp = rand(7, 22) * R;
      const life = rand(0.35, 1.0);
      return {
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - R * 1.5,
        life, max: life,
        w: rand(1.2, 2.6) * (R / 40),
      };
    });

    // bomb ke dhaatu ke tukde
    this.debris = Array.from({ length: 14 }, () => {
      const a = rand(0, TAU);
      const sp = rand(5, 15) * R;
      const life = rand(0.9, 1.5);
      return {
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - R * 3,
        rot: rand(0, TAU),
        vr: rand(-12, 12),
        s: rand(0.07, 0.17) * R,
        life, max: life,
        pts: [0, 1, 2].map(() => ({ a: rand(0, TAU), d: rand(0.5, 1) })),
      };
    });

    // kaala dhuaan
    this.smoke = Array.from({ length: 12 }, () => {
      const a = rand(0, TAU);
      const d = rand(0, 0.9) * R;
      return {
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        r0: rand(0.5, 0.9) * R,
        r1: rand(1.8, 3.0) * R,
        delay: rand(0.05, 0.3),
        life: rand(1.0, 1.6),
        vx: rand(-0.8, 0.8) * R,
        vy: -rand(0.5, 1.6) * R,
        shade: Math.floor(rand(28, 70)),
      };
    });
  }

  update(dt, gravity) {
    this.t += dt;

    const drag = Math.pow(0.12, dt);
    for (const s of this.sparks) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.vx *= drag;
      s.vy = s.vy * drag + gravity * 0.35 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }

    for (const d of this.debris) {
      if (d.life <= 0) continue;
      d.life -= dt;
      d.vy += gravity * 0.9 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
    }

    if (this.t > LIFE) this.dead = true;
  }

  // scene ke andar draw hota hai (screen shake ke saath hilta hai)
  draw(ctx) {
    const { x, y, R, t } = this;
    ctx.save();

    // 1) dhuaan
    for (const s of this.smoke) {
      const age = t - s.delay;
      if (age <= 0 || age > s.life) continue;
      const p = age / s.life;
      const rad = s.r0 + (s.r1 - s.r0) * easeOut(p);
      const a = 0.62 * Math.pow(1 - p, 1.2) * clamp01(age / 0.12);
      const px = s.x + s.vx * age;
      const py = s.y + s.vy * age;
      const c = s.shade;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(${c},${c},${c},${a})`);
      g.addColorStop(0.6, `rgba(${c},${c},${c},${a * 0.55})`);
      g.addColorStop(1, `rgba(${c},${c},${c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, TAU);
      ctx.fill();
    }

    // 2) dhaatu ke tukde
    for (const d of this.debris) {
      if (d.life <= 0) continue;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = clamp01(d.life / 0.3);
      ctx.fillStyle = '#1a1c24';
      ctx.strokeStyle = 'rgba(190,200,230,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      d.pts.forEach((p, i) => {
        const px = Math.cos(p.a) * d.s * p.d;
        const py = Math.sin(p.a) * d.s * p.d;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3) roshni wali cheezein (additive blending se asli aag jaisi chamak)
    ctx.globalCompositeOperation = 'lighter';

    // badi aag ka gola
    const p = t / 0.5;
    if (p < 1) {
      const rad = R * (0.5 + 3.3 * easeOut(p));
      ctx.fillStyle = fireGradient(ctx, x, y, rad, Math.pow(1 - p, 0.7));
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fill();
    }

    // chhote aag ke gole
    for (const b of this.blobs) {
      const age = t - b.delay;
      if (age <= 0 || age > b.life) continue;
      const q = age / b.life;
      const rad = b.r * (0.4 + 0.8 * easeOut(q));
      ctx.fillStyle = fireGradient(ctx, b.x, b.y, rad, (1 - q) * 0.9);
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad, 0, TAU);
      ctx.fill();
    }

    // shuru ka safed-garam centre
    if (t < 0.14) {
      const q = t / 0.14;
      const rad = R * (1.2 + 1.6 * q);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(255,255,255,${1 - q})`);
      g.addColorStop(0.5, `rgba(255,245,200,${(1 - q) * 0.6})`);
      g.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fill();
    }

    // shockwave ring
    if (t < 0.4) {
      const q = t / 0.4;
      ctx.strokeStyle = `rgba(255,235,190,${(1 - q) * 0.55})`;
      ctx.lineWidth = (1 + 4 * (1 - q)) * (R / 40);
      ctx.beginPath();
      ctx.arc(x, y, R * (0.8 + 5.5 * easeOut(q)), 0, TAU);
      ctx.stroke();
    }

    // chingariyaan: gati ki direction mein lakeer
    ctx.lineCap = 'round';
    for (const s of this.sparks) {
      if (s.life <= 0) continue;
      const k = s.life / s.max;
      const col = k > 0.66 ? '255,240,200' : k > 0.33 ? '255,170,60' : '255,90,30';
      ctx.strokeStyle = `rgba(${col},${k})`;
      ctx.lineWidth = s.w * (0.5 + k * 0.5);
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // poori screen par flash: bomb ki jagah se phailti hui garam roshni, seedhi safed chaadar nahi
  drawFlash(ctx, w, h) {
    const t = this.t;
    if (t > 0.45) return;

    ctx.save();
    if (t < 0.2) {
      const q = t / 0.2;
      const a = Math.pow(1 - q, 1.6) * 0.95;
      const rad = Math.max(w, h) * (0.55 + 0.6 * q);
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, rad);
      g.addColorStop(0, `rgba(255,255,245,${a})`);
      g.addColorStop(0.25, `rgba(255,235,170,${a * 0.75})`);
      g.addColorStop(0.6, `rgba(255,170,70,${a * 0.35})`);
      g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // halka garam tint jo dheere utarta hai
    const q2 = clamp01(t / 0.45);
    ctx.globalAlpha = 0.16 * (1 - q2);
    ctx.fillStyle = '#ff7a2a';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}