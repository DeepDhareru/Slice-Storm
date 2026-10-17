// kate hue fruit ka ek aadha hissa
export default class FruitHalf {
  constructor(type, r, x, y, vx, vy, angle, side, spin) {
    this.type = type;
    this.r = r;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle; // is angle par kaat wali line local x-axis ke saath rahegi
    this.side = side;   // 0 = upar wala hissa, 1 = neeche wala
    this.spin = spin;
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

  draw(ctx) {
    const { r } = this;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // sirf aadha circle dikhao
    ctx.beginPath();
    if (this.side === 0) ctx.arc(0, 0, r, Math.PI, Math.PI * 2);
    else ctx.arc(0, 0, r, 0, Math.PI);
    ctx.closePath();
    ctx.clip();

    // chhilka
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, this.type.color);
    g.addColorStop(1, this.type.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // kate hue hisse ka andar wala gooda
    const thick = r * 0.2;
    const y0 = this.side === 0 ? -thick : 0;
    ctx.fillStyle = this.type.flesh;
    ctx.fillRect(-r, y0, r * 2, thick);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(-r * 0.8, y0 + thick * 0.2, r * 1.6, thick * 0.3);

    ctx.restore();
  }
}