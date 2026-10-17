export default class Blade {
  constructor() {
    this.points = [];     // { x, y, age, brk }
    this.segments = [];   // is frame ki nayi lines, collision ke liye
    this.active = false;
    this.maxAge = 0.25;
    this.maxPoints = 40;
  }

  begin(x, y) {
    this.active = true;
    this.points.push({ x, y, age: 0, brk: true });
  }

  move(x, y) {
    if (!this.active) return;
    const last = this.points[this.points.length - 1];

    // ungli rukne se saare points gayab ho gaye the, to naye sire se shuru
    if (!last) {
      this.points.push({ x, y, age: 0, brk: true });
      return;
    }
    if (Math.hypot(x - last.x, y - last.y) < 2) return;

    this.segments.push({ x1: last.x, y1: last.y, x2: x, y2: y });
    this.points.push({ x, y, age: 0, brk: false });
    if (this.points.length > this.maxPoints) this.points.shift();
  }

  // Engine har frame mein nayi lines le jaata hai
  takeSegments() {
    const s = this.segments;
    this.segments = [];
    return s;
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

      const life = 1 - (a.age + b.age) / 2 / this.maxAge;
      if (life <= 0) continue;

      ctx.globalAlpha = life;

      ctx.strokeStyle = '#4de1ff';
      ctx.lineWidth = 3 + life * 11;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 + life * 4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}