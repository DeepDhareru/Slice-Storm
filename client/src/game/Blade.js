export default class Blade {
  constructor() {
    this.points = [];     // { x, y, age, brk } (purana pehle, naya baad mein)
    this.active = false;
    this.maxAge = 0.25;   // trail kitni der mein gayab hoga (seconds)
    this.maxPoints = 40;
  }

  begin(x, y) {
    this.active = true;
    // brk = nayi swipe ki shuruaat, purani swipe se line nahi judegi
    this.points.push({ x, y, age: 0, brk: true });
  }

  move(x, y) {
    if (!this.active) return;
    const last = this.points[this.points.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 2) return; // bahut chhote jhatke ignore
    this.points.push({ x, y, age: 0, brk: false });
    if (this.points.length > this.maxPoints) this.points.shift();
  }

  end() {
    this.active = false;
  }

  update(dt) {
    for (const p of this.points) p.age += dt;
    this.points = this.points.filter((p) => p.age < this.maxAge);
  }

  draw(ctx) {
    const pts = this.points;
    if (pts.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#4de1ff';
    ctx.shadowBlur = 16;

    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (b.brk) continue;

      const life = 1 - (a.age + b.age) / 2 / this.maxAge; // 1 = bilkul naya
      if (life <= 0) continue;

      ctx.globalAlpha = life;

      ctx.strokeStyle = '#4de1ff';     // bahar ki glow
      ctx.lineWidth = 3 + life * 11;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';     // andar ki chamakti line
      ctx.lineWidth = 1 + life * 4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}