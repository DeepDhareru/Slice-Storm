export default class Fruit {
  constructor(type, r, x, y, vx, vy) {
    this.type = type;
    this.r = r;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() * 2 - 1) * 4; // radian per second
  }

  update(dt, gravity) {
    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.spin * dt;
  }

  // neeche girke screen se bahar nikal gaya
  isGone(height) {
    return this.y - this.r > height && this.vy > 0;
  }

  draw(ctx) {
    const { r } = this;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, this.type.color);
    g.addColorStop(1, this.type.dark);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // tana aur patta, taaki rotation dikhe
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = Math.max(2, r * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.lineTo(r * 0.08, -r * 1.12);
    ctx.stroke();

    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(r * 0.28, -r * 0.95, r * 0.22, r * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}