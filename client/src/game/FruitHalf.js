import { drawSprite } from './fruitArt';

// kate hue fruit ka ek aadha hissa, andar ka design dikhata hai
export default class FruitHalf {
  constructor(type, r, x, y, vx, vy, angle, side, spin, interior) {
    this.type = type;
    this.r = r;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle; // is angle par kaat wali line local x-axis ke saath rahegi
    this.side = side;   // 0 = upar wala hissa, 1 = neeche wala
    this.spin = spin;
    this.interior = interior;
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

    drawSprite(ctx, this.interior);

    // kinaron par halka andhera, taaki gol shape ka depth dikhe
    const shade = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = shade;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // kate hue kinare par geeli chamak
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.restore();
  }
}